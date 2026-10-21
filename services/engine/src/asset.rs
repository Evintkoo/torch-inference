// Copyright (c) 2026 Torviello.
//! Confined, digest-verified model asset store for ENG-005.
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Component, Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::error::{AppError, AppResult};
use crate::model::validate_model_id;

pub const STAGING_DIR: &str = ".staging";
pub const ASSET_FILE: &str = "asset.bin";
pub const MANIFEST_FILE: &str = "manifest.json";
const COPY_BUFFER_BYTES: usize = 65_536;
const MAX_TASK_ID_BYTES: usize = 64;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Manifest {
    pub model_id: String,
    pub digest: String,
    pub size_bytes: u64,
    pub activated_at: u64,
}

#[derive(Debug, Clone)]
pub struct AssetStore {
    root: PathBuf,
    max_bytes: u64,
}

impl AssetStore {
    pub fn new(root: &Path, max_bytes: u64) -> AppResult<Self> {
        fs::create_dir_all(root).map_err(|_| AppError::Unavailable)?;
        let root = fs::canonicalize(root).map_err(|_| AppError::Unavailable)?;
        let staging = root.join(STAGING_DIR);
        fs::create_dir_all(&staging).map_err(|_| AppError::Unavailable)?;
        if is_symlink(&staging)? {
            return Err(AppError::PathOutsideRoot);
        }
        Ok(Self { root, max_bytes })
    }

    #[must_use]
    pub fn root(&self) -> &Path {
        &self.root
    }

    #[must_use]
    pub fn max_bytes(&self) -> u64 {
        self.max_bytes
    }

    pub fn validate_local_source(&self, relative: &str) -> AppResult<()> {
        let relative_path = relative_path(relative)?;
        reject_symlink_components(&self.root, relative_path)?;
        let source = self.root.join(relative_path);
        let metadata = fs::metadata(&source).map_err(|_| AppError::InvalidSource)?;
        if !metadata.is_file() {
            return Err(AppError::InvalidSource);
        }
        if metadata.len() > self.max_bytes {
            return Err(AppError::ModelTooLarge);
        }
        Ok(())
    }

    pub fn model_dir(&self, model_id: &str) -> AppResult<PathBuf> {
        validate_model_id(model_id)?;
        let directory = self.root.join(model_id);
        if directory.parent() != Some(self.root.as_path()) {
            return Err(AppError::PathOutsideRoot);
        }
        if is_symlink(&directory)? {
            return Err(AppError::PathOutsideRoot);
        }
        Ok(directory)
    }

    #[must_use]
    pub fn manifest(&self, model_id: &str) -> Option<Manifest> {
        let directory = self.model_dir(model_id).ok()?;
        let text = fs::read_to_string(directory.join(MANIFEST_FILE)).ok()?;
        let manifest: Manifest = serde_json::from_str(&text).ok()?;
        if manifest.model_id != model_id || !valid_digest(&manifest.digest) {
            return None;
        }
        let asset = directory.join(ASSET_FILE);
        let metadata = fs::symlink_metadata(&asset).ok()?;
        if !metadata.is_file() || metadata.len() != manifest.size_bytes {
            return None;
        }
        Some(manifest)
    }

    #[must_use]
    pub fn is_ready(&self, model_id: &str) -> bool {
        self.manifest(model_id).is_some()
    }

    #[must_use]
    pub fn size_bytes(&self, model_id: &str) -> u64 {
        self.manifest(model_id).map_or(0, |item| item.size_bytes)
    }

    pub fn ready_asset(&self, model_id: &str) -> AppResult<(PathBuf, Manifest)> {
        let manifest = self.manifest(model_id).ok_or(AppError::ModelNotReady)?;
        let asset = self.model_dir(model_id)?.join(ASSET_FILE);
        let canonical = fs::canonicalize(&asset).map_err(|_| AppError::ModelNotReady)?;
        if !canonical.starts_with(&self.root) || is_symlink(&asset)? {
            return Err(AppError::PathOutsideRoot);
        }
        Ok((canonical, manifest))
    }

    pub fn copy_local_to_staging(&self, relative: &str, task_id: &str) -> AppResult<PathBuf> {
        let relative_path = relative_path(relative)?;
        reject_symlink_components(&self.root, relative_path)?;
        let source = self.root.join(relative_path);
        let metadata = fs::metadata(&source).map_err(|_| AppError::InvalidSource)?;
        if !metadata.is_file() {
            return Err(AppError::InvalidSource);
        }
        if metadata.len() > self.max_bytes {
            return Err(AppError::ModelTooLarge);
        }
        let staging = self.staging_path(task_id)?;
        let mut reader = File::open(&source).map_err(|_| AppError::InvalidSource)?;
        write_bounded(&mut reader, &staging, self.max_bytes)?;
        Ok(staging)
    }

    pub fn commit(
        &self,
        staging: &Path,
        model_id: &str,
        expected_digest: &str,
    ) -> AppResult<Manifest> {
        let result = self.commit_inner(staging, model_id, expected_digest);
        if result.is_err() {
            let _ = fs::remove_file(staging);
        }
        result
    }

    fn commit_inner(
        &self,
        staging: &Path,
        model_id: &str,
        expected_digest: &str,
    ) -> AppResult<Manifest> {
        if !staging.starts_with(&self.root) {
            return Err(AppError::PathOutsideRoot);
        }
        let (digest, size_bytes) = digest_file(staging)?;
        if size_bytes > self.max_bytes {
            return Err(AppError::ModelTooLarge);
        }
        if digest != expected_digest {
            return Err(AppError::DigestMismatch);
        }
        let directory = self.model_dir(model_id)?;
        fs::create_dir_all(&directory).map_err(|_| AppError::Internal)?;
        let asset = directory.join(ASSET_FILE);
        if is_symlink(&asset)? {
            return Err(AppError::PathOutsideRoot);
        }
        let temporary = directory.join("asset.bin.tmp");
        let _ = fs::remove_file(&temporary);
        fs::rename(staging, &temporary).map_err(|_| AppError::Internal)?;
        replace_file(&temporary, &asset)?;
        let manifest = Manifest {
            model_id: model_id.to_owned(),
            digest,
            size_bytes,
            activated_at: unix_seconds(),
        };
        let manifest_tmp = directory.join("manifest.json.tmp");
        let payload = serde_json::to_vec(&manifest).map_err(|_| AppError::Internal)?;
        fs::write(&manifest_tmp, payload).map_err(|_| AppError::Internal)?;
        replace_file(&manifest_tmp, &directory.join(MANIFEST_FILE))?;
        Ok(manifest)
    }

    pub fn staging_path(&self, task_id: &str) -> AppResult<PathBuf> {
        let valid = !task_id.is_empty()
            && task_id.len() <= MAX_TASK_ID_BYTES
            && task_id
                .bytes()
                .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-');
        if !valid {
            return Err(AppError::Internal);
        }
        Ok(self.root.join(STAGING_DIR).join(format!("{task_id}.part")))
    }
}

fn relative_path(relative: &str) -> AppResult<&Path> {
    let path = Path::new(relative);
    if path.is_absolute()
        || path.as_os_str().is_empty()
        || path
            .components()
            .any(|part| !matches!(part, Component::Normal(_)))
    {
        return Err(AppError::PathOutsideRoot);
    }
    Ok(path)
}

fn is_symlink(path: &Path) -> AppResult<bool> {
    match fs::symlink_metadata(path) {
        Ok(metadata) => Ok(metadata.file_type().is_symlink()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(false),
        Err(_) => Err(AppError::PathOutsideRoot),
    }
}

fn reject_symlink_components(root: &Path, relative: &Path) -> AppResult<()> {
    let mut current = root.to_path_buf();
    for part in relative.components() {
        let Component::Normal(segment) = part else {
            return Err(AppError::PathOutsideRoot);
        };
        current.push(segment);
        if is_symlink(&current)? {
            return Err(AppError::PathOutsideRoot);
        }
    }
    Ok(())
}

fn write_bounded(reader: &mut File, destination: &Path, max_bytes: u64) -> AppResult<()> {
    let mut writer = File::create(destination).map_err(|_| AppError::Internal)?;
    let mut buffer = vec![0_u8; COPY_BUFFER_BYTES];
    let mut written: u64 = 0;
    loop {
        let read = reader
            .read(&mut buffer)
            .map_err(|_| AppError::InvalidSource)?;
        if read == 0 {
            break;
        }
        written = written.saturating_add(u64::try_from(read).unwrap_or(u64::MAX));
        if written > max_bytes {
            let _ = fs::remove_file(destination);
            return Err(AppError::ModelTooLarge);
        }
        writer
            .write_all(&buffer[..read])
            .map_err(|_| AppError::Internal)?;
    }
    writer.flush().map_err(|_| AppError::Internal)?;
    Ok(())
}

pub fn digest_file(path: &Path) -> AppResult<(String, u64)> {
    let mut file = File::open(path).map_err(|_| AppError::InvalidSource)?;
    let mut hasher = Sha256::new();
    let mut buffer = vec![0_u8; COPY_BUFFER_BYTES];
    let mut size: u64 = 0;
    loop {
        let read = file
            .read(&mut buffer)
            .map_err(|_| AppError::InvalidSource)?;
        if read == 0 {
            break;
        }
        size = size.saturating_add(u64::try_from(read).unwrap_or(u64::MAX));
        hasher.update(&buffer[..read]);
    }
    Ok((format!("sha256:{:x}", hasher.finalize()), size))
}

fn replace_file(from: &Path, to: &Path) -> AppResult<()> {
    #[cfg(windows)]
    {
        let _ = fs::remove_file(to);
    }
    fs::rename(from, to).map_err(|_| AppError::Internal)
}

fn valid_digest(value: &str) -> bool {
    value.strip_prefix("sha256:").is_some_and(|digest| {
        digest.len() == 64 && digest.bytes().all(|byte| byte.is_ascii_hexdigit())
    })
}

fn unix_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |duration| duration.as_secs())
}

#[cfg(test)]
mod tests {
    use super::{AssetStore, digest_file, valid_digest};
    use crate::error::AppError;

    #[test]
    fn rejects_traversal_and_absolute_paths() {
        let root = tempdir();
        let store = AssetStore::new(&root, 1_024).expect("store");
        assert!(matches!(
            store.copy_local_to_staging("../escape", "task-1"),
            Err(AppError::PathOutsideRoot)
        ));
        assert!(matches!(
            store.copy_local_to_staging("/etc/passwd", "task-1"),
            Err(AppError::PathOutsideRoot)
        ));
    }

    #[test]
    fn rejects_unknown_manifest_and_short_digest() {
        let root = tempdir();
        let store = AssetStore::new(&root, 1_024).expect("store");
        assert!(!store.is_ready("engine-demo-classifier"));
        assert!(!valid_digest("sha256:abc"));
    }

    #[test]
    fn digest_is_stable_for_the_same_bytes() {
        let root = tempdir();
        let path = root.join("fixture.bin");
        std::fs::write(&path, b"fixture").expect("write");
        let first = digest_file(&path).expect("digest");
        let second = digest_file(&path).expect("digest");
        assert_eq!(first, second);
        assert_eq!(first.1, 7);
    }

    fn tempdir() -> std::path::PathBuf {
        let path = std::env::temp_dir().join(format!("torviello-asset-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&path).expect("tempdir");
        path
    }
}

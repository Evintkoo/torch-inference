// Copyright (c) 2026 Torviello.
//! `TorchScript` execution adapter. The HTTP layer never depends on `tch` types.
use std::path::Path;
use std::sync::Arc;

use super::{
    AppError, AppResult, ImageSpec, MAX_CLASSES, ModelRecord, Runtime, TORCHSCRIPT_FORMAT,
    TensorInput, TensorOutput,
};
use crate::config::Accelerators;

const MAX_IMAGE_DIM: u32 = 4_096;

pub(super) fn load(
    record: &ModelRecord,
    path: &Path,
    max_bytes: u64,
    accelerators: &Accelerators,
) -> AppResult<Arc<dyn Runtime>> {
    let spec = ImageSpec {
        channels: record.input_channels,
        height: record.input_height,
        width: record.input_width,
    };
    Ok(Arc::new(TorchScriptClassifier::load(
        path,
        record.labels.clone(),
        spec,
        max_bytes,
        accelerators,
    )?))
}

pub(super) struct TorchScriptClassifier {
    module: tch::CModule,
    labels: Vec<String>,
    image_spec: ImageSpec,
    device: tch::Device,
}

fn select_device(accelerators: &Accelerators) -> tch::Device {
    #[cfg(all(feature = "metal", target_os = "macos"))]
    if accelerators.metal && tch::utils::has_mps() {
        return tch::Device::Mps;
    }
    #[cfg(feature = "vulkan")]
    if accelerators.vulkan && tch::utils::has_vulkan() {
        return tch::Device::Vulkan;
    }
    if accelerators.metal || accelerators.vulkan {
        let requested = if accelerators.metal {
            "metal"
        } else {
            "vulkan"
        };
        tracing::warn!(
            event = "accelerator_fallback",
            requested,
            selected = "cpu",
            "Requested accelerator unavailable; using CPU"
        );
    }
    tch::Device::Cpu
}

impl TorchScriptClassifier {
    fn load(
        path: &Path,
        labels: Vec<String>,
        image_spec: ImageSpec,
        max_bytes: u64,
        accelerators: &Accelerators,
    ) -> AppResult<Self> {
        let metadata = std::fs::metadata(path).map_err(|_| AppError::ModelNotReady)?;
        if metadata.len() > max_bytes {
            return Err(AppError::ModelTooLarge);
        }
        if labels.is_empty()
            || labels.len() > MAX_CLASSES
            || labels.iter().any(String::is_empty)
            || image_spec.channels == 0
            || image_spec.height == 0
            || image_spec.width == 0
            || image_spec.height > MAX_IMAGE_DIM
            || image_spec.width > MAX_IMAGE_DIM
        {
            return Err(AppError::BackendUnavailable);
        }
        let device = select_device(accelerators);
        let module =
            tch::CModule::load_on_device(path, device).map_err(|_| AppError::BackendUnavailable)?;
        Ok(Self {
            module,
            labels,
            image_spec,
            device,
        })
    }
}

impl Runtime for TorchScriptClassifier {
    fn backend(&self) -> &'static str {
        self.device()
    }

    fn device(&self) -> &'static str {
        match self.device {
            tch::Device::Vulkan => "vulkan",
            tch::Device::Mps => "metal",
            _ => "cpu",
        }
    }

    fn format(&self) -> &'static str {
        TORCHSCRIPT_FORMAT
    }

    fn labels(&self) -> &[String] {
        &self.labels
    }

    fn image_spec(&self) -> Option<ImageSpec> {
        Some(self.image_spec)
    }

    fn infer(&self, input: TensorInput<'_>) -> AppResult<TensorOutput> {
        let expected = input.shape.iter().try_fold(1_i64, |total, value| {
            total.checked_mul(*value).ok_or(AppError::InvalidInput)
        })?;
        if expected != i64::try_from(input.data.len()).map_err(|_| AppError::InvalidInput)?
            || input.shape.len() != 4
            || input.shape[1] != i64::from(self.image_spec.channels)
            || input.shape[2] != i64::from(self.image_spec.height)
            || input.shape[3] != i64::from(self.image_spec.width)
            || input.data.iter().any(|value| !value.is_finite())
        {
            return Err(AppError::InvalidInput);
        }
        let tensor = tch::Tensor::from_slice(input.data)
            .reshape(input.shape)
            .to_device(self.device);
        let output =
            tch::no_grad(|| self.module.forward_ts(&[tensor])).map_err(|_| AppError::Internal)?;
        let shape = output.size();
        if shape.len() != 2 {
            return Err(AppError::Internal);
        }
        let rows = usize::try_from(shape[0]).map_err(|_| AppError::Internal)?;
        let columns = usize::try_from(shape[1]).map_err(|_| AppError::Internal)?;
        if columns != self.labels.len() {
            return Err(AppError::Internal);
        }
        let data = Vec::<f32>::try_from(
            output
                .to_kind(tch::Kind::Float)
                .to_device(tch::Device::Cpu)
                .reshape([-1]),
        )
        .map_err(|_| AppError::Internal)?;
        if data.len() != rows.checked_mul(columns).ok_or(AppError::Internal)?
            || data.iter().any(|value| !value.is_finite())
        {
            return Err(AppError::Internal);
        }
        let probabilities = softmax_rows(&data, columns);
        Ok(TensorOutput {
            data: probabilities,
            shape,
        })
    }
}

fn softmax_rows(values: &[f32], columns: usize) -> Vec<f32> {
    if columns == 0 {
        return Vec::new();
    }
    values
        .chunks(columns)
        .flat_map(super::reference::softmax)
        .collect::<Vec<f32>>()
}

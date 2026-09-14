//! Shared ONNX Runtime session construction — execution-provider selection
//! and session building are identical across every engine in this service.

use anyhow::Result;
use ort::session::{builder::GraphOptimizationLevel, Session};
use std::path::Path;

pub fn build_session(onnx_path: &Path, ep_preference: &str, n_threads: i32) -> Result<Session> {
    let threads = n_threads.max(1);
    let builder = Session::builder()?
        .with_optimization_level(GraphOptimizationLevel::Level3)?
        .with_intra_threads(threads as usize)?
        .with_execution_providers(build_eps(ep_preference))?;
    Ok(builder.commit_from_file(onnx_path)?)
}

/// GPU-first EP chain (CoreML on macOS / CUDA elsewhere -> CPU).
/// `ep_preference = "cpu"` opts out for tests/fixtures that don't want GPU EP
/// probing. ORT silently skips any EP whose native runtime is absent.
pub fn build_eps(ep_preference: &str) -> Vec<ort::execution_providers::ExecutionProviderDispatch> {
    let mut eps: Vec<ort::execution_providers::ExecutionProviderDispatch> = Vec::new();

    if ep_preference != "cpu" {
        #[cfg(target_os = "macos")]
        {
            eps.push(
                ort::execution_providers::CoreMLExecutionProvider::default()
                    .with_subgraphs(true)
                    .with_compute_units(ort::execution_providers::coreml::CoreMLComputeUnits::All)
                    .build(),
            );
        }
        #[cfg(not(target_os = "macos"))]
        {
            eps.push(ort::execution_providers::CUDAExecutionProvider::default().build());
        }
    }

    eps.push(ort::execution_providers::CPUExecutionProvider::default().build());
    eps
}

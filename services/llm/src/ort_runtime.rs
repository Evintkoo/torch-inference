//! Process-wide ONNX Runtime environment with a single shared thread pool.
//!
//! `SmolVlmEngine::load` builds three sessions (vision encoder, embedding,
//! decoder) each with its own `n_threads`-sized private pool (`ort_session::
//! build_session`); `HrmEngine::load` builds one more. Only one of those
//! sessions is ever the hot path within a given forward pass — the vision
//! encoder and embedding pools sit idle (but still allocated) while the
//! decoder runs its autoregressive loop — so per-session pools waste both
//! threads and memory even within a single engine.
//!
//! Calling [`init_shared_environment`] before any session is built commits a
//! single `ort::Environment` with a global thread pool that all sessions in
//! the process draw from instead. See the identical rationale in the main
//! server's `src/core/ort_runtime.rs`.
use std::sync::Once;

static INIT: Once = Once::new();

/// Commits the shared ORT environment. Must run before the first
/// `Session::builder()...commit_from_*()` call in the process (i.e. before
/// `SmolVlmEngine::load` / `HrmEngine::load`). Safe to call more than once;
/// only the first call takes effect.
pub fn init_shared_environment() {
    INIT.call_once(|| {
        let physical_cpus = num_cpus::get_physical().max(1);
        let build = || -> ort::Result<()> {
            let pool = ort::environment::GlobalThreadPoolOptions::default()
                .with_intra_threads(physical_cpus)?
                .with_inter_threads(1)?;
            ort::init()
                .with_name("llm-service")
                .with_global_thread_pool(pool)
                .commit()?;
            Ok(())
        };
        match build() {
            Ok(()) => tracing::info!(
                "ort_runtime: shared global thread pool committed (intra_threads={physical_cpus}, inter_threads=1) — all ORT sessions now draw from one pool"
            ),
            Err(e) => tracing::error!(
                "ort_runtime: failed to commit shared ORT thread pool ({e}); engines will fall back to independent per-session pools"
            ),
        }
    });
}

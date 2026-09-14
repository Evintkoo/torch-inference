//! Process-wide ONNX Runtime environment with a single shared thread pool.
//!
//! Every ORT-backed engine (Kokoro TTS session pool, image classifier, YOLO
//! detector, Whisper encoder + decoder) independently calls
//! `Session::builder().with_intra_threads(physical_cpus)`. Without a shared
//! environment, each of those sessions gets its *own* private thread pool
//! sized to every physical core, so under any concurrent multimodal load
//! (e.g. TTS + classify + STT at once) the process ends up with N
//! independent full-core thread pools fighting over the same cores — more
//! OS threads than the machine has cores, plus a separate memory arena per
//! session.
//!
//! Calling [`init_shared_environment`] before any session is built commits a
//! single `ort::Environment` with a global thread pool. ORT then
//! transparently disables each session's private pool (`ort`'s
//! `DisablePerSessionThreads`, triggered automatically once a global pool is
//! committed) and routes all intra-op work through the one shared pool
//! instead — bounded, contended-but-fair parallelism rather than
//! oversubscription. No caller-side changes are needed: existing
//! `.with_intra_threads(..)` calls become harmless no-ops once the global
//! pool is active.
use std::sync::Once;

static INIT: Once = Once::new();

/// Commits the shared ORT environment. Must run before the first
/// `Session::builder()...commit_from_*()` call anywhere in the process —
/// ORT lazily creates a private, non-shared environment on first use, and an
/// environment's thread-pool mode can't change after that. Safe to call more
/// than once; only the first call takes effect.
pub fn init_shared_environment() {
    INIT.call_once(|| {
        let physical_cpus = num_cpus::get_physical().max(1);
        let build = || -> ort::Result<()> {
            let pool = ort::environment::GlobalThreadPoolOptions::default()
                .with_intra_threads(physical_cpus)?
                .with_inter_threads(1)?;
            ort::init()
                .with_name("torch-inference")
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

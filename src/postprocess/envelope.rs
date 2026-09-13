#[derive(Debug, serde::Serialize)]
pub struct Envelope<T> {
    pub data: T,
    pub meta: ResponseMeta,
}

#[derive(Debug, serde::Serialize)]
pub struct ResponseMeta {
    pub latency_ms: f64,
    pub model_id: String,
    pub postprocessing_applied: bool,
    pub postprocess_steps: Vec<String>,
    pub warnings: Vec<String>,
    pub version: &'static str,
    pub request_id: String,
}

impl<T> Envelope<T> {
    /// Low-level constructor. Prefer [`Envelope::from_inference`] in handlers;
    /// this remains for direct/construction-from-custom-meta callers and tests.
    #[allow(dead_code)]
    pub fn new(data: T, meta: ResponseMeta) -> Self {
        Self { data, meta }
    }

    /// Build an envelope from a request's measured latency and the result of
    /// the (possibly skipped) postprocess step.
    ///
    /// Centralises the response-meta construction that was previously hand
    /// inlined at six handler call sites (classify/yolo/tts/audio). `version`
    /// is always the crate version; `postprocessing_applied` is derived as
    /// "postprocess ran AND produced steps".
    pub fn from_inference(
        data: T,
        latency: std::time::Duration,
        model_id: impl Into<String>,
        skip_postprocess: bool,
        postprocess_steps: Vec<String>,
        warnings: Vec<String>,
        request_id: impl Into<String>,
    ) -> Self {
        let postprocessing_applied = !skip_postprocess && !postprocess_steps.is_empty();
        Self {
            data,
            meta: ResponseMeta {
                latency_ms: latency.as_secs_f64() * 1000.0,
                model_id: model_id.into(),
                postprocessing_applied,
                postprocess_steps,
                warnings,
                version: env!("CARGO_PKG_VERSION"),
                request_id: request_id.into(),
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::Serialize;

    #[test]
    fn test_envelope_serializes_data_and_meta() {
        #[derive(Serialize)]
        struct Payload {
            value: u32,
        }

        let meta = ResponseMeta {
            latency_ms: 42.0,
            model_id: "test-model".into(),
            postprocessing_applied: true,
            postprocess_steps: vec!["normalize".into()],
            warnings: vec![],
            version: "1.0.0",
            request_id: "req-123".into(),
        };
        let envelope = Envelope::new(Payload { value: 7 }, meta);
        let json = serde_json::to_string(&envelope).unwrap();
        assert!(json.contains("\"value\":7"));
        assert!(json.contains("\"latency_ms\":42.0"));
        assert!(json.contains("\"model_id\":\"test-model\""));
        assert!(json.contains("\"postprocessing_applied\":true"));
        assert!(json.contains("\"normalize\""));
    }

    #[test]
    fn test_envelope_postprocessing_false_when_steps_empty() {
        #[derive(Serialize)]
        struct Payload {
            ok: bool,
        }

        let meta = ResponseMeta {
            latency_ms: 1.0,
            model_id: "m".into(),
            postprocessing_applied: false,
            postprocess_steps: vec![],
            warnings: vec![],
            version: "1.0.0",
            request_id: "r".into(),
        };
        let env = Envelope::new(Payload { ok: true }, meta);
        let json = serde_json::to_string(&env).unwrap();
        assert!(json.contains("\"postprocessing_applied\":false"));
    }

    #[test]
    fn test_envelope_warnings_propagated() {
        #[derive(Serialize)]
        struct Payload {}

        let meta = ResponseMeta {
            latency_ms: 0.0,
            model_id: "m".into(),
            postprocessing_applied: true,
            postprocess_steps: vec![],
            warnings: vec!["clipping_detected".into()],
            version: "1.0.0",
            request_id: "r".into(),
        };
        let env = Envelope::new(Payload {}, meta);
        let json = serde_json::to_string(&env).unwrap();
        assert!(json.contains("clipping_detected"));
    }
}

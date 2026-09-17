//! Executor: plans → SSE event stream.
//!
//! Owns the per-request RunContext, dispatches steps via ToolRegistry,
//! resolves `{{stepN.field}}` refs, enforces step/deadline budgets, and
//! emits AgentEvents into an mpsc channel that the actix handler drains.

use anyhow::Result;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::mpsc;

use crate::agent::dsl::{parse, ArgValue, Step};
use crate::agent::planner::Planner;
use crate::agent::prompt::{build_planner_prompt, build_repair_prompt};
use crate::agent::sse::{AgentEvent, PlanStep};
use crate::agent::tool::ToolRegistry;

#[derive(Debug, Clone)]
pub enum Input {
    Image { b64: String, mime: String },
    Audio { b64: String, mime: String },
    Text  { value: String },
}

pub struct RunContext {
    pub run_id:        String,
    pub started_at:    Instant,
    pub deadline:      Instant,
    pub inputs:        HashMap<String, Input>,
    pub results:       HashMap<String, Value>,
    pub sse_tx:        mpsc::Sender<AgentEvent>,
    pub max_steps:     usize,
    pub per_tool_ms:   u64,
    /// Per-field trim threshold, applied to each tool result before it's
    /// stored/emitted. From `LimitsConfig.results.field_trim_above`.
    pub field_trim_above:  usize,
    /// Running total of (post-trim) result bytes accumulated so far this run.
    pub results_bytes:     usize,
    /// Budget for `results_bytes`. From `LimitsConfig.results.per_run_bytes`.
    pub per_run_bytes:      usize,
}

pub struct ExecOptions {
    pub max_steps:           usize,
    pub max_run_ms:          u64,
    pub per_tool_ms:         u64,
    pub planner_temperature: f32,
    pub planner_max_tokens:  u32,
    /// SSE event channel capacity. From `LimitsConfig.channels.sse_event_buffer`.
    pub sse_event_buffer:    usize,
    /// From `LimitsConfig.results.field_trim_above`.
    pub field_trim_above:    usize,
    /// From `LimitsConfig.results.per_run_bytes`.
    pub per_run_bytes:       usize,
}

pub async fn run_agent(
    planner: Arc<dyn Planner>,
    registry: Arc<ToolRegistry>,
    user_msg: String,
    inputs: HashMap<String, Input>,
    opts: ExecOptions,
) -> mpsc::Receiver<AgentEvent> {
    let (tx, rx) = mpsc::channel::<AgentEvent>(opts.sse_event_buffer.max(1));
    tokio::spawn(run_inner(planner, registry, user_msg, inputs, opts, tx));
    rx
}

async fn run_inner(
    planner: Arc<dyn Planner>,
    registry: Arc<ToolRegistry>,
    user_msg: String,
    inputs: HashMap<String, Input>,
    opts: ExecOptions,
    tx: mpsc::Sender<AgentEvent>,
) {
    let started_at = Instant::now();
    let deadline   = started_at + Duration::from_millis(opts.max_run_ms);
    let run_id     = ulid::Ulid::new().to_string();

    let _ = tx.send(AgentEvent::RunStart {
        run_id: run_id.clone(),
        model: "hrm-text-1b".into(),
        deadline_ms: opts.max_run_ms,
        max_steps: opts.max_steps,
    }).await;

    let mut ctx = RunContext {
        run_id, started_at, deadline,
        inputs, results: HashMap::new(),
        sse_tx: tx.clone(),
        max_steps: opts.max_steps, per_tool_ms: opts.per_tool_ms,
        field_trim_above: opts.field_trim_above,
        results_bytes: 0,
        per_run_bytes: opts.per_run_bytes,
    };

    let summary = input_summary(&ctx.inputs);
    let prompt  = build_planner_prompt(&user_msg, &summary);

    // Attempt 1
    let mut retries = 0u8;
    let raw1 = match planner.propose(prompt.clone(), opts.planner_max_tokens, opts.planner_temperature).await {
        Ok(s) => s,
        Err(e) => {
            let _ = tx.send(AgentEvent::Error {
                kind: "planner_failed".into(),
                message: e.to_string(),
            }).await;
            emit_synthesized_final(&ctx, started_at, false, &tx).await;
            return;
        }
    };

    let steps = match parse(&raw1) {
        Ok(s) => s,
        Err(e1) => {
            retries = 1;
            let repair = build_repair_prompt(&raw1, &e1.to_string());
            let raw2 = match planner.propose(repair, opts.planner_max_tokens, opts.planner_temperature).await {
                Ok(s) => s,
                Err(e) => {
                    let _ = tx.send(AgentEvent::Error {
                        kind: "planner_failed".into(),
                        message: e.to_string(),
                    }).await;
                    emit_synthesized_final(&ctx, started_at, false, &tx).await;
                    return;
                }
            };
            match parse(&raw2) {
                Ok(s) => s,
                Err(e2) => {
                    let _ = tx.send(AgentEvent::Error {
                        kind: "plan_unparseable".into(),
                        message: format!("first parse: {}; second parse: {}", e1, e2),
                    }).await;
                    emit_synthesized_final(&ctx, started_at, false, &tx).await;
                    return;
                }
            }
        }
    };

    // Emit plan event
    let plan_payload: Vec<PlanStep> = steps.iter().map(|s| PlanStep {
        id: s.id.clone(), tool: s.tool.clone(), args: s.args_as_json(),
    }).collect();
    let _ = tx.send(AgentEvent::Plan { steps: plan_payload, retries }).await;

    // Execute
    let mut steps_executed = 0usize;
    for (i, step) in steps.iter().enumerate() {
        if i >= ctx.max_steps { break; }
        if Instant::now() >= ctx.deadline {
            let _ = tx.send(AgentEvent::Error {
                kind: "deadline_exceeded".into(),
                message: format!("hit {}ms cap", opts.max_run_ms),
            }).await;
            break;
        }
        if ctx.sse_tx.is_closed() { return; }   // client disconnected

        let resolved = match resolve_step_args(step, &ctx) {
            Ok(v)  => v,
            Err(e) => {
                let _ = tx.send(AgentEvent::StepResult {
                    idx: i + 1, id: step.id.clone(), ok: false,
                    value: None, error: Some(format!("ref_unresolved: {}", e)),
                    duration_ms: 0,
                }).await;
                ctx.results.insert(step.id.clone(),
                    json!({"error": format!("ref_unresolved: {}", e)}));
                steps_executed += 1;
                continue;
            }
        };

        let _ = tx.send(AgentEvent::StepStart {
            idx: i + 1, id: step.id.clone(), tool: step.tool.clone(),
            args: redact_for_sse(&resolved),
        }).await;

        let tool_deadline = std::cmp::min(
            ctx.deadline, Instant::now() + Duration::from_millis(ctx.per_tool_ms),
        );
        let started = Instant::now();
        let result = registry.dispatch(&step.tool, resolved, tool_deadline).await;
        let dur = started.elapsed().as_millis() as u64;
        steps_executed += 1;

        match result {
            Ok(value) => {
                // Cap any individual field before it's stored/streamed — a
                // tool that returns a large flat text field (fetched body,
                // transcript, description) shouldn't be allowed to blow past
                // the per-run result budget on its own.
                let trimmed = trim_large_fields(value, ctx.field_trim_above);
                ctx.results_bytes += serde_json::to_string(&trimmed)
                    .map(|s| s.len()).unwrap_or(0);
                ctx.results.insert(step.id.clone(), trimmed.clone());
                let _ = tx.send(AgentEvent::StepResult {
                    idx: i + 1, id: step.id.clone(), ok: true,
                    value: Some(trimmed), error: None, duration_ms: dur,
                }).await;
            }
            Err(e) => {
                ctx.results.insert(step.id.clone(),
                    json!({"error": e.to_string()}));
                let _ = tx.send(AgentEvent::StepResult {
                    idx: i + 1, id: step.id.clone(), ok: false,
                    value: None, error: Some(e.to_string()), duration_ms: dur,
                }).await;
            }
        }

        if step.tool == "final" {
            let answer = ctx.results.get(&step.id)
                .and_then(|v| v.get("answer"))
                .and_then(Value::as_str).unwrap_or("").to_string();
            let _ = tx.send(AgentEvent::Final {
                answer, steps_executed,
                total_ms: started_at.elapsed().as_millis() as u64,
                completed: true,
            }).await;
            return;
        }

        // Checked AFTER the `final` short-circuit above so a `final` step's
        // own (already field-trimmed) answer is always honored rather than
        // discarded by a budget that a prior step pushed over the edge.
        if ctx.results_bytes > ctx.per_run_bytes {
            let _ = tx.send(AgentEvent::Error {
                kind: "result_budget_exceeded".into(),
                message: format!(
                    "accumulated result size {}B exceeds budget {}B — stopping run",
                    ctx.results_bytes, ctx.per_run_bytes,
                ),
            }).await;
            break;
        }
    }

    emit_synthesized_final(&ctx, started_at, false, &tx).await;
    let _ = (); // ensure tx kept alive until here
}

fn input_summary(inputs: &HashMap<String, Input>) -> String {
    match inputs.get("input") {
        Some(Input::Image { .. }) => "Image attached.".into(),
        Some(Input::Audio { .. }) => "Audio attached.".into(),
        Some(Input::Text  { .. }) => "Extra text input attached.".into(),
        None => "".into(),
    }
}

fn resolve_step_args(step: &Step, ctx: &RunContext) -> Result<Value, String> {
    let mut m = serde_json::Map::new();
    for (k, v) in &step.args {
        let resolved = match v {
            ArgValue::Literal(val) => {
                // Special keyword: literal "input" → swap for staged input.
                if let Some(s) = val.as_str() {
                    if s == "input" {
                        match ctx.inputs.get("input") {
                            Some(Input::Image { b64, mime }) =>
                                Value::String(format!("data:{};base64,{}", mime, b64)),
                            Some(Input::Audio { b64, mime }) =>
                                Value::String(format!("data:{};base64,{}", mime, b64)),
                            Some(Input::Text  { value })     => Value::String(value.clone()),
                            None => return Err(format!("`input` referenced but no input staged")),
                        }
                    } else { val.clone() }
                } else { val.clone() }
            }
            ArgValue::Ref { step_id, field } => {
                let step_result = ctx.results.get(step_id)
                    .ok_or_else(|| format!("step `{}` has not run", step_id))?;
                // Special: `.error` returns the error message or empty string.
                if field == "error" {
                    return_value_for_error_field(step_result, &mut m, k);
                    continue;
                }
                step_result.get(field).cloned()
                    .ok_or_else(|| format!("step `{}` has no field `{}`", step_id, field))?
            }
        };
        m.insert(k.clone(), resolved);
    }
    Ok(Value::Object(m))
}

fn return_value_for_error_field(step_result: &Value, m: &mut serde_json::Map<String, Value>, key: &str) {
    let err_str = step_result.get("error")
        .and_then(Value::as_str).unwrap_or("").to_string();
    m.insert(key.to_string(), Value::String(err_str));
}

/// Truncates any top-level string field of `value` longer than `threshold`
/// bytes, replacing it with a UTF-8-safe truncated prefix plus a marker
/// noting the original size. Mirrors `redact_for_sse`'s shallow (top-level
/// only) field walk — the realistic overflow source is a flat text field
/// (fetched body, transcript, description); structured tool outputs are
/// already small.
fn trim_large_fields(value: Value, threshold: usize) -> Value {
    let mut out = value;
    if let Value::Object(m) = &mut out {
        for (_, v) in m.iter_mut() {
            if let Value::String(s) = v {
                if s.len() > threshold {
                    let original_len = s.len();
                    let mut cut = s.as_bytes()[..threshold].to_vec();
                    while std::str::from_utf8(&cut).is_err() {
                        cut.pop();
                    }
                    let head = String::from_utf8(cut).unwrap_or_default();
                    *s = format!("{head}...<truncated, original {original_len}B>");
                }
            }
        }
    }
    out
}

fn redact_for_sse(args: &Value) -> Value {
    let mut out = args.clone();
    if let Value::Object(m) = &mut out {
        for (_, v) in m.iter_mut() {
            if let Value::String(s) = v {
                if s.starts_with("data:") && s.len() > 64 {
                    *s = format!("<{}B data uri>", s.len());
                }
            }
        }
    }
    out
}

async fn emit_synthesized_final(
    ctx: &RunContext, started_at: Instant, completed: bool,
    tx: &mpsc::Sender<AgentEvent>,
) {
    let fallback = fallback_answer(&ctx.results);
    let _ = tx.send(AgentEvent::Final {
        answer: fallback,
        steps_executed: ctx.results.len(),
        total_ms: started_at.elapsed().as_millis() as u64,
        completed,
    }).await;
}

fn fallback_answer(results: &HashMap<String, Value>) -> String {
    if results.is_empty() {
        return "I couldn't form a plan for this request.".into();
    }
    let mut ks: Vec<&String> = results.keys().collect();
    ks.sort();
    if let Some(last) = ks.last() {
        if let Some(out) = results[last.as_str()].get("output").and_then(Value::as_str) {
            return out.to_string();
        }
        if let Some(ans) = results[last.as_str()].get("answer").and_then(Value::as_str) {
            return ans.to_string();
        }
    }
    "I ran into trouble completing this. (No final step.)".into()
}

#[cfg(test)]
mod tests {
    use super::*;
    use async_trait::async_trait;
    use serde_json::json;
    use std::sync::Mutex;
    use crate::agent::tool::ToolError;

    struct CannedPlanner(Mutex<Vec<String>>);
    #[async_trait]
    impl Planner for CannedPlanner {
        async fn propose(&self, _p: String, _m: u32, _t: f32) -> Result<String> {
            let mut q = self.0.lock().unwrap();
            if q.is_empty() { return Ok("step1. final(answer=\"empty\")".into()); }
            Ok(q.remove(0))
        }
    }
    fn canned(outputs: Vec<&str>) -> Arc<dyn Planner> {
        Arc::new(CannedPlanner(Mutex::new(outputs.into_iter().map(String::from).collect())))
    }

    fn registry_with(tools: Vec<Arc<dyn crate::agent::tool::Tool>>) -> Arc<ToolRegistry> {
        let mut reg = ToolRegistry::new();
        for t in tools { reg.insert(t); }
        Arc::new(reg)
    }

    fn opts() -> ExecOptions {
        ExecOptions {
            max_steps: 8, max_run_ms: 5_000, per_tool_ms: 2_000,
            planner_temperature: 0.0, planner_max_tokens: 128,
            sse_event_buffer: 8, field_trim_above: 8_192, per_run_bytes: 65_536,
        }
    }

    use crate::agent::tools::final_tool::FinalTool;

    #[tokio::test]
    async fn happy_path_single_final_step() {
        let p = canned(vec!["step1. final(answer=\"hi\")"]);
        let reg = registry_with(vec![Arc::new(FinalTool)]);
        let mut rx = run_agent(p, reg, "Say hi".into(), HashMap::new(), opts()).await;
        let mut events = Vec::new();
        while let Some(e) = rx.recv().await { events.push(e); }
        assert!(matches!(events[0], AgentEvent::RunStart { .. }));
        assert!(matches!(events[1], AgentEvent::Plan { .. }));
        assert!(matches!(events.last().unwrap(), AgentEvent::Final { ref answer, completed: true, .. } if answer == "hi"));
    }

    #[tokio::test]
    async fn parse_repair_succeeds_on_second_try() {
        let p = canned(vec!["GARBAGE OUTPUT", "step1. final(answer=\"ok\")"]);
        let reg = registry_with(vec![Arc::new(FinalTool)]);
        let mut rx = run_agent(p, reg, "Q".into(), HashMap::new(), opts()).await;
        let mut had_plan = false;
        let mut final_ok = false;
        while let Some(e) = rx.recv().await {
            if let AgentEvent::Plan { retries, .. } = &e { assert_eq!(*retries, 1); had_plan = true; }
            if let AgentEvent::Final { completed, .. } = &e { final_ok = *completed; }
        }
        assert!(had_plan && final_ok);
    }

    #[tokio::test]
    async fn unparseable_twice_emits_error_and_synthesized_final() {
        let p = canned(vec!["GARBAGE 1", "GARBAGE 2"]);
        let reg = registry_with(vec![Arc::new(FinalTool)]);
        let mut rx = run_agent(p, reg, "Q".into(), HashMap::new(), opts()).await;
        let mut saw_err = false;
        let mut saw_final = false;
        while let Some(e) = rx.recv().await {
            match e {
                AgentEvent::Error { kind, .. } if kind == "plan_unparseable" => saw_err = true,
                AgentEvent::Final { completed: false, .. } => saw_final = true,
                _ => {}
            }
        }
        assert!(saw_err && saw_final);
    }

    struct AlwaysFailTool;
    #[async_trait::async_trait]
    impl crate::agent::tool::Tool for AlwaysFailTool {
        fn name(&self) -> &'static str { "classify" }
        async fn invoke(&self, _: Value, _: Instant) -> Result<Value, ToolError> {
            Err(ToolError::Upstream("forced failure".into()))
        }
    }

    #[tokio::test]
    async fn step_failure_propagates_via_error_ref() {
        let p = canned(vec!["\
step1. classify(image=input)
step2. final(answer={{step1.error}})
"]);
        let reg = registry_with(vec![Arc::new(AlwaysFailTool), Arc::new(FinalTool)]);
        let inputs = {
            let mut m = HashMap::new();
            m.insert("input".to_string(),
                     Input::Image { b64: "AA".into(), mime: "image/jpeg".into() });
            m
        };
        let mut rx = run_agent(p, reg, "Q".into(), inputs, opts()).await;
        let mut final_answer = String::new();
        while let Some(e) = rx.recv().await {
            if let AgentEvent::Final { answer, .. } = e { final_answer = answer; }
        }
        assert!(final_answer.contains("forced failure"));
    }

    #[tokio::test]
    async fn deadline_truncates_run() {
        let p = canned(vec!["\
step1. final(answer=\"ok\")
"]);
        let reg = registry_with(vec![Arc::new(FinalTool)]);
        let mut o = opts();
        o.max_run_ms = 0; // already past deadline
        let mut rx = run_agent(p, reg, "Q".into(), HashMap::new(), o).await;
        let mut saw_deadline_err = false;
        while let Some(e) = rx.recv().await {
            if let AgentEvent::Error { kind, .. } = &e {
                if kind == "deadline_exceeded" { saw_deadline_err = true; }
            }
        }
        assert!(saw_deadline_err);
    }

    #[tokio::test]
    async fn input_keyword_resolves_to_data_uri() {
        // Verifies that an `image=input` step gets the staged base64+mime as a data URI.
        struct CaptureTool(std::sync::Mutex<Option<Value>>);
        #[async_trait::async_trait]
        impl crate::agent::tool::Tool for CaptureTool {
            fn name(&self) -> &'static str { "classify" }
            async fn invoke(&self, args: Value, _: Instant) -> Result<Value, ToolError> {
                *self.0.lock().unwrap() = Some(args);
                Ok(json!({"label":"x","confidence":0.0,"all":[]}))
            }
        }
        let cap = Arc::new(CaptureTool(std::sync::Mutex::new(None)));
        let p = canned(vec!["\
step1. classify(image=input)
step2. final(answer=\"done\")
"]);
        let reg = registry_with(vec![cap.clone(), Arc::new(FinalTool)]);
        let mut inputs = HashMap::new();
        inputs.insert("input".to_string(),
            Input::Image { b64: "XYZ".into(), mime: "image/png".into() });
        let mut rx = run_agent(p, reg, "Q".into(), inputs, opts()).await;
        while rx.recv().await.is_some() {}
        let seen = cap.0.lock().unwrap().clone().unwrap();
        let s = seen.get("image").and_then(Value::as_str).unwrap();
        assert!(s.starts_with("data:image/png;base64,XYZ"));
    }

    #[tokio::test]
    async fn step_start_redacts_data_uris() {
        struct NoopTool;
        #[async_trait::async_trait]
        impl crate::agent::tool::Tool for NoopTool {
            fn name(&self) -> &'static str { "classify" }
            async fn invoke(&self, _: Value, _: Instant) -> Result<Value, ToolError> {
                Ok(json!({"label":"x","confidence":0.0,"all":[]}))
            }
        }
        let p = canned(vec!["\
step1. classify(image=input)
step2. final(answer=\"x\")
"]);
        let reg = registry_with(vec![Arc::new(NoopTool), Arc::new(FinalTool)]);
        let mut inputs = HashMap::new();
        let big = "A".repeat(200);
        inputs.insert("input".to_string(),
            Input::Image { b64: big, mime: "image/png".into() });
        let mut rx = run_agent(p, reg, "Q".into(), inputs, opts()).await;
        let mut saw_redaction = false;
        while let Some(e) = rx.recv().await {
            if let AgentEvent::StepStart { args, .. } = &e {
                if let Some(s) = args.get("image").and_then(Value::as_str) {
                    if s.contains("data uri") { saw_redaction = true; }
                }
            }
        }
        assert!(saw_redaction);
    }

    #[tokio::test]
    async fn client_disconnect_stops_executor() {
        let p = canned(vec!["\
step1. final(answer=\"ok\")
"]);
        let reg = registry_with(vec![Arc::new(FinalTool)]);
        let rx = run_agent(p, reg, "Q".into(), HashMap::new(), opts()).await;
        drop(rx);
        // No assertion needed beyond the fact that we don't hang; the spawned
        // task should observe sse_tx closure between/at-start of dispatches.
        tokio::time::sleep(Duration::from_millis(50)).await;
    }

    #[test]
    fn trim_large_fields_truncates_oversized_string_and_leaves_small_fields() {
        let value = json!({
            "small": "ok",
            "big": "A".repeat(100),
        });
        let out = trim_large_fields(value, 10);
        assert_eq!(out["small"], "ok");
        let big = out["big"].as_str().unwrap();
        assert!(big.starts_with(&"A".repeat(10)));
        assert!(big.contains("truncated, original 100B"));
        assert!(big.len() < 100, "field must actually shrink");
    }

    #[test]
    fn trim_large_fields_is_noop_under_threshold() {
        let value = json!({"field": "short"});
        let out = trim_large_fields(value.clone(), 8_192);
        assert_eq!(out, value);
    }

    struct BigOutputTool(String);
    #[async_trait::async_trait]
    impl crate::agent::tool::Tool for BigOutputTool {
        fn name(&self) -> &'static str { "classify" }
        async fn invoke(&self, _: Value, _: Instant) -> Result<Value, ToolError> {
            Ok(json!({"output": self.0.clone()}))
        }
    }

    #[tokio::test]
    async fn step_result_field_is_trimmed_to_configured_threshold() {
        let p = canned(vec!["\
step1. classify(image=input)
step2. final(answer=\"done\")
"]);
        let reg = registry_with(vec![Arc::new(BigOutputTool("X".repeat(500))), Arc::new(FinalTool)]);
        let mut inputs = HashMap::new();
        inputs.insert("input".to_string(), Input::Image { b64: "AA".into(), mime: "image/png".into() });
        let mut o = opts();
        o.field_trim_above = 50;
        o.per_run_bytes = 1_000_000; // large enough not to trip the run-level budget here
        let mut rx = run_agent(p, reg, "Q".into(), inputs, o).await;
        let mut saw_trim = false;
        while let Some(e) = rx.recv().await {
            if let AgentEvent::StepResult { value: Some(v), .. } = &e {
                if let Some(out) = v.get("output").and_then(Value::as_str) {
                    assert!(out.len() < 500, "field should have been trimmed, got len {}", out.len());
                    assert!(out.contains("truncated"));
                    saw_trim = true;
                }
            }
        }
        assert!(saw_trim, "expected a trimmed classify output field");
    }

    #[tokio::test]
    async fn run_stops_early_once_result_budget_exceeded() {
        // Two intermediate steps whose (small, per-field-untrimmed) outputs
        // together exceed a tiny per_run_bytes budget must stop the run with
        // a `result_budget_exceeded` error rather than run every step.
        let p = canned(vec!["\
step1. classify(image=input)
step2. classify(image=input)
step3. final(answer=\"done\")
"]);
        let reg = registry_with(vec![
            Arc::new(BigOutputTool("Y".repeat(100))),
            Arc::new(FinalTool),
        ]);
        let mut inputs = HashMap::new();
        inputs.insert("input".to_string(), Input::Image { b64: "AA".into(), mime: "image/png".into() });
        let mut o = opts();
        o.field_trim_above = 10_000; // don't trim the field itself
        o.per_run_bytes = 120;       // but do trip the cumulative budget after step1
        let mut rx = run_agent(p, reg, "Q".into(), inputs, o).await;
        let mut saw_budget_err = false;
        let mut step_results = 0usize;
        while let Some(e) = rx.recv().await {
            match e {
                AgentEvent::Error { kind, .. } if kind == "result_budget_exceeded" => saw_budget_err = true,
                AgentEvent::StepResult { .. } => step_results += 1,
                _ => {}
            }
        }
        assert!(saw_budget_err, "expected a result_budget_exceeded error event");
        assert!(step_results < 3, "run should have stopped before all steps executed, got {step_results}");
    }
}

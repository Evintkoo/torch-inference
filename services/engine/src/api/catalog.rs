// Copyright (c) 2026 Torviello.
//! Model catalog reads for ENG-004.
use axum::Json;
use axum::extract::{Path, State};
use axum::http::HeaderMap;

use crate::api::schemas::{Envelope, ModelDetail, ModelSummary, envelope};
use crate::api::{AppState, authenticate_if_enabled};
use crate::error::{AppError, AppResult};

pub async fn list_models(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> AppResult<Json<Envelope<Vec<ModelSummary>>>> {
    authenticate_if_enabled(&state, &headers)?;
    let mut data = Vec::with_capacity(state.registry.all().len());
    for record in state.registry.all() {
        data.push(summary(&state, record).await);
    }
    Ok(Json(envelope(
        data,
        "",
        "cpu",
        vec!["catalog_only".to_owned()],
    )))
}

pub async fn get_model(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(model_id): Path<String>,
) -> AppResult<Json<Envelope<ModelDetail>>> {
    authenticate_if_enabled(&state, &headers)?;
    crate::model::validate_model_id(&model_id)?;
    let record = state
        .registry
        .find(&model_id)
        .ok_or(AppError::ModelNotFound)?;
    let detail = ModelDetail::from_record(record, summary(&state, record).await);
    Ok(Json(envelope(detail, &model_id, "cpu", Vec::new())))
}

async fn summary(state: &AppState, record: &crate::model::ModelRecord) -> ModelSummary {
    let locally_available = state.assets.is_ready(&record.id);
    let download_state = if locally_available {
        "ready"
    } else {
        state
            .acquisition
            .state(&record.id)
            .await
            .map_or("absent", |value| value.as_str())
    };
    let load_state = state
        .models
        .slot_state(&record.id)
        .map_or("unloaded", |slot| slot.state.as_str());
    ModelSummary::from_record(record, locally_available, download_state, load_state)
}

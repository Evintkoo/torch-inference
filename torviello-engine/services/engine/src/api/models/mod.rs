// Copyright (c) 2026 Torviello.
//! Model acquisition and load lifecycle routes for ENG-005 and ENG-006.
use std::convert::Infallible;
use std::time::Duration;

use axum::Json;
use axum::extract::rejection::JsonRejection;
use axum::extract::{Extension, Path, State};
use axum::http::StatusCode;
use axum::response::sse::{Event, KeepAlive, Sse};
use tokio_stream::Stream;

use crate::acquisition::{DownloadJob, DownloadRequest};
use crate::api::schemas::envelope;
use crate::api::{AppState, RequestContext};
use crate::error::{AppError, AppResult};
use crate::runtime::ModelSlot;

pub async fn download(
    State(state): State<AppState>,
    Extension(context): Extension<RequestContext>,
    Path(model_id): Path<String>,
    payload: Result<Json<DownloadRequest>, JsonRejection>,
) -> AppResult<(StatusCode, Json<crate::api::schemas::Envelope<DownloadJob>>)> {
    crate::model::validate_model_id(&model_id)?;
    let Json(request) = payload.map_err(|rejection| match rejection {
        JsonRejection::MissingJsonContentType(_) => AppError::UnsupportedMediaType,
        JsonRejection::BytesRejection(_) => AppError::PayloadTooLarge,
        _ => AppError::InvalidInput,
    })?;
    let audit_id = crate::api::begin_audit(&state, &context, "download", &model_id).await?;
    let result = state.acquisition.start(&model_id, request).await;
    crate::api::finish_audit(&state, audit_id, result.as_ref().err()).await;
    let job = result?;
    Ok((
        StatusCode::ACCEPTED,
        Json(envelope(job, &model_id, "none", Vec::new())),
    ))
}

pub async fn download_status(
    State(state): State<AppState>,
    Extension(_context): Extension<RequestContext>,
    Path(model_id): Path<String>,
) -> AppResult<Json<crate::api::schemas::Envelope<DownloadJob>>> {
    crate::model::validate_model_id(&model_id)?;
    let job = state.acquisition.status(&model_id).await?;
    Ok(Json(envelope(job, &model_id, "none", Vec::new())))
}

pub async fn download_progress(
    State(state): State<AppState>,
    Extension(_context): Extension<RequestContext>,
    Path(model_id): Path<String>,
) -> AppResult<Sse<impl Stream<Item = Result<Event, Infallible>>>> {
    crate::model::validate_model_id(&model_id)?;
    let stream = state.acquisition.progress(&model_id).await?;
    Ok(Sse::new(stream).keep_alive(
        KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("keep-alive"),
    ))
}

pub async fn load(
    State(state): State<AppState>,
    Extension(context): Extension<RequestContext>,
    Path(model_id): Path<String>,
) -> AppResult<(StatusCode, Json<crate::api::schemas::Envelope<ModelSlot>>)> {
    crate::model::validate_model_id(&model_id)?;
    let audit_id = crate::api::begin_audit(&state, &context, "load", &model_id).await?;
    let result = state.models.load(&model_id).await;
    crate::api::finish_audit(&state, audit_id, result.as_ref().err()).await;
    let slot = result?;
    let backend = slot.backend.clone().unwrap_or_else(|| "cpu".to_owned());
    Ok((
        StatusCode::ACCEPTED,
        Json(envelope(slot, &model_id, &backend, Vec::new())),
    ))
}

pub async fn unload(
    State(state): State<AppState>,
    Extension(context): Extension<RequestContext>,
    Path(model_id): Path<String>,
) -> AppResult<(StatusCode, Json<crate::api::schemas::Envelope<ModelSlot>>)> {
    crate::model::validate_model_id(&model_id)?;
    let audit_id = crate::api::begin_audit(&state, &context, "unload", &model_id).await?;
    let result = state.models.unload(&model_id).await;
    crate::api::finish_audit(&state, audit_id, result.as_ref().err()).await;
    let slot = result?;
    let backend = slot.backend.clone().unwrap_or_else(|| "cpu".to_owned());
    Ok((
        StatusCode::ACCEPTED,
        Json(envelope(slot, &model_id, &backend, Vec::new())),
    ))
}

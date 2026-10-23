// Copyright (c) 2026 Torviello.
//! Image classification over the `Runtime` port for ENG-007 and ENG-010.
use std::io::Cursor;
use std::time::Instant;

use axum::Json;
use axum::extract::multipart::MultipartRejection;
use axum::extract::{Extension, Multipart, State};
use image::imageops::FilterType;
use image::{ImageReader, Limits};
use serde::Serialize;

use crate::api::schemas::Envelope;
use crate::api::{AppState, RequestContext};
use crate::error::{AppError, AppResult};
use crate::runtime::{ImageSpec, TensorInput};

const MAX_CLASSIFY_IMAGES: usize = 128;
const MAX_TOP_K: u32 = 1_000;
const MAX_DECODE_DIMENSION: u32 = 8_192;
const MAX_DECODE_ALLOC_BYTES: u64 = 256 * 1024 * 1024;

#[derive(Debug, Serialize)]
pub struct Classification {
    pub index: usize,
    pub predictions: Vec<Prediction>,
}

#[derive(Debug, Serialize)]
pub struct Prediction {
    pub label: String,
    pub score: f32,
}

#[allow(clippy::too_many_lines)]
pub async fn classify(
    State(state): State<AppState>,
    Extension(context): Extension<RequestContext>,
    multipart: Result<Multipart, MultipartRejection>,
) -> AppResult<Json<Envelope<Vec<Classification>>>> {
    let started = Instant::now();
    let mut multipart = multipart.map_err(|_| AppError::UnsupportedMediaType)?;
    let mut images: Vec<Vec<u8>> = Vec::new();
    let mut model_id: Option<String> = None;
    let mut top_k: Option<u32> = None;
    let limit = state.config.max_batch_size.clamp(1, MAX_CLASSIFY_IMAGES);

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| AppError::InvalidInput)?
    {
        match field.name().unwrap_or_default() {
            "images" => {
                if images.len() >= limit {
                    return Err(AppError::PayloadTooLarge);
                }
                if let Some(content_type) = field.content_type()
                    && !content_type.starts_with("image/")
                {
                    return Err(AppError::UnsupportedMediaType);
                }
                let bytes = field.bytes().await.map_err(|_| AppError::InvalidInput)?;
                if bytes.is_empty() {
                    return Err(AppError::InvalidInput);
                }
                images.push(bytes.to_vec());
            }
            "model_id" => {
                let value = field.text().await.map_err(|_| AppError::InvalidInput)?;
                model_id = Some(value.trim().to_owned());
            }
            "top_k" => {
                let value = field.text().await.map_err(|_| AppError::InvalidInput)?;
                top_k = Some(value.trim().parse().map_err(|_| AppError::InvalidInput)?);
            }
            _ => {}
        }
    }

    let model_id = model_id.ok_or(AppError::InvalidInput)?;
    crate::model::validate_model_id(&model_id)?;
    if images.is_empty() {
        return Err(AppError::InvalidInput);
    }
    let top_k = top_k.unwrap_or(5);
    if !(1..=MAX_TOP_K).contains(&top_k) {
        return Err(AppError::InvalidInput);
    }

    let guard = state.models.acquire(&model_id)?;
    let audit_id = crate::api::begin_audit(&state, &context, "inference", &model_id).await?;
    let labels = guard.labels();
    let spec = guard.image_spec().ok_or(AppError::BackendUnavailable)?;
    let mut input = Vec::with_capacity(
        images.len() * spec.channels as usize * spec.height as usize * spec.width as usize,
    );
    for image in &images {
        input.extend(decode_and_normalize(image, spec)?);
    }
    let batch = i64::try_from(images.len()).map_err(|_| AppError::PayloadTooLarge)?;
    let shape = [
        batch,
        i64::from(spec.channels),
        i64::from(spec.height),
        i64::from(spec.width),
    ];
    let output = match guard.infer(TensorInput {
        data: &input,
        shape: &shape,
    }) {
        Ok(output) => output,
        Err(error) => {
            crate::api::finish_audit(&state, audit_id, Some(&error)).await;
            return Err(error);
        }
    };
    let columns = labels.len();
    if columns == 0 || output.data.len() != images.len() * columns {
        let error = AppError::Internal;
        crate::api::finish_audit(&state, audit_id, Some(&error)).await;
        return Err(error);
    }

    let top_k = usize::try_from(top_k).unwrap_or(columns).min(columns);
    let classifications = output
        .data
        .chunks(columns)
        .enumerate()
        .map(|(index, row)| Classification {
            index,
            predictions: top_predictions(row, labels, top_k),
        })
        .collect();

    let mut response = crate::api::schemas::envelope(
        classifications,
        &model_id,
        guard.slot().backend.as_deref().unwrap_or("cpu"),
        Vec::new(),
    );
    response.meta.latency_ms = u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX);
    response.meta.request_id.clone_from(&context.request_id);
    crate::api::finish_audit(&state, audit_id, None).await;
    Ok(Json(response))
}

fn top_predictions(row: &[f32], labels: &[String], top_k: usize) -> Vec<Prediction> {
    let mut scored: Vec<(usize, f32)> = row.iter().copied().enumerate().collect();
    scored.sort_by(|left, right| {
        right
            .1
            .total_cmp(&left.1)
            .then_with(|| left.0.cmp(&right.0))
    });
    scored.truncate(top_k);
    scored
        .into_iter()
        .map(|(index, score)| Prediction {
            label: labels
                .get(index)
                .cloned()
                .unwrap_or_else(|| format!("class_{index}")),
            score,
        })
        .collect()
}

fn decode_and_normalize(bytes: &[u8], spec: ImageSpec) -> AppResult<Vec<f32>> {
    let mut limits = Limits::default();
    limits.max_image_width = Some(MAX_DECODE_DIMENSION);
    limits.max_image_height = Some(MAX_DECODE_DIMENSION);
    limits.max_alloc = Some(MAX_DECODE_ALLOC_BYTES);
    let mut reader = ImageReader::new(Cursor::new(bytes));
    reader.limits(limits);
    let image = reader
        .with_guessed_format()
        .map_err(|_| AppError::InvalidInput)?
        .decode()
        .map_err(|_| AppError::InvalidInput)?;

    let mut channels = Vec::with_capacity(spec.channels as usize);
    match spec.channels {
        1 => {
            let resized = image::imageops::resize(
                &image.to_luma8(),
                spec.width,
                spec.height,
                FilterType::Triangle,
            );
            channels.push(resized.pixels().map(|pixel| pixel[0]).collect::<Vec<_>>());
        }
        3 => {
            let resized = image::imageops::resize(
                &image.to_rgb8(),
                spec.width,
                spec.height,
                FilterType::Triangle,
            );
            for channel in 0..3 {
                channels.push(
                    resized
                        .pixels()
                        .map(|pixel| pixel[channel])
                        .collect::<Vec<_>>(),
                );
            }
        }
        4 => {
            let resized = image::imageops::resize(
                &image.to_rgba8(),
                spec.width,
                spec.height,
                FilterType::Triangle,
            );
            for channel in 0..4 {
                channels.push(
                    resized
                        .pixels()
                        .map(|pixel| pixel[channel])
                        .collect::<Vec<_>>(),
                );
            }
        }
        _ => return Err(AppError::BackendUnavailable),
    }

    Ok(channels
        .into_iter()
        .flat_map(|channel| {
            channel
                .into_iter()
                .map(|value| f32::from(value) / 255.0)
                .collect::<Vec<_>>()
        })
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn png(pixel: [u8; 3]) -> Vec<u8> {
        use image::{ImageFormat, RgbImage};
        let image = RgbImage::from_pixel(2, 2, image::Rgb(pixel));
        let mut bytes = Cursor::new(Vec::new());
        image::DynamicImage::ImageRgb8(image)
            .write_to(&mut bytes, ImageFormat::Png)
            .expect("png");
        bytes.into_inner()
    }

    #[test]
    fn decodes_one_three_and_four_channel_specs() {
        let bytes = png([10, 20, 30]);
        for channels in [1, 3, 4] {
            let output = decode_and_normalize(
                &bytes,
                ImageSpec {
                    channels,
                    height: 2,
                    width: 2,
                },
            )
            .expect("decode");
            assert_eq!(output.len(), channels as usize * 4);
            assert!(output.iter().all(|value| (0.0..=1.0).contains(value)));
        }
    }

    #[test]
    fn rejects_corrupt_images_and_unsupported_channel_counts() {
        assert!(matches!(
            decode_and_normalize(
                b"not an image",
                ImageSpec {
                    channels: 3,
                    height: 1,
                    width: 1,
                },
            ),
            Err(AppError::InvalidInput)
        ));
        assert!(matches!(
            decode_and_normalize(
                &png([0, 0, 0]),
                ImageSpec {
                    channels: 2,
                    height: 1,
                    width: 1,
                },
            ),
            Err(AppError::BackendUnavailable)
        ));
    }

    #[test]
    fn top_predictions_are_ordered_tied_by_index_and_capped() {
        let labels = vec!["a".to_owned(), "b".to_owned(), "c".to_owned()];
        let predictions = top_predictions(&[0.1, 0.5, 0.5], &labels, 2);
        assert_eq!(predictions.len(), 2);
        assert_eq!(predictions[0].label, "b");
        assert_eq!(predictions[1].label, "c");
        let missing = top_predictions(&[0.9], &[], 1);
        assert_eq!(missing[0].label, "class_0");
        assert!(top_predictions(&[0.1], &labels, 0).is_empty());
    }
}

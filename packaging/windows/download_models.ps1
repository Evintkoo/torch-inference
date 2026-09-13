# Download the Piper TTS and Whisper STT models for torch-inference server.
# Mirrors scripts/download_models.sh. Run from the directory containing
# this script (the installed package root).
#
# Models NOT covered here (obtain separately — see README-first-run.txt):
#   models\kokoro-82m\, models\yolo\yolov8n.onnx, models\classify\*.onnx

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

$HfBase = "https://huggingface.co"
$OpenAiWhisper = "https://openaipublic.azureedge.net/main/whisper/models"

Write-Host "=== Downloading Piper en_US-lessac-medium ONNX TTS ==="
New-Item -ItemType Directory -Force -Path "models\tts\piper_lessac" | Out-Null

$PiperModel = "models\tts\piper_lessac\model.onnx"
if (-not (Test-Path $PiperModel)) {
    Invoke-WebRequest -Uri "$HfBase/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx" -OutFile $PiperModel
    Write-Host "  OK model.onnx"
} else {
    Write-Host "  OK model.onnx (already present)"
}

$PiperConfig = "models\tts\piper_lessac\config.json"
if (-not (Test-Path $PiperConfig)) {
    Invoke-WebRequest -Uri "$HfBase/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json" -OutFile $PiperConfig
    Write-Host "  OK config.json"
} else {
    Write-Host "  OK config.json (already present)"
}

Write-Host ""
Write-Host "=== Downloading OpenAI Whisper base STT model ==="
New-Item -ItemType Directory -Force -Path "models\whisper" | Out-Null

$WhisperHash = "ed3a0b6b1c0edf879ad9b11b1af5a0e6ab5db9205f891f668f8b0e6c6326e34e"
$WhisperModel = "models\whisper\whisper-base.pt"
if (-not (Test-Path $WhisperModel)) {
    Invoke-WebRequest -Uri "$OpenAiWhisper/$WhisperHash/base.pt" -OutFile $WhisperModel
    Write-Host "  OK whisper-base.pt"
} else {
    Write-Host "  OK whisper-base.pt (already present)"
}

Write-Host ""
Write-Host "=== Creating stub engine directories ==="
foreach ($dir in @("models\vits", "models\styletts2", "models\xtts", "models\bark")) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "  OK $dir\"
}

Write-Host ""
Write-Host "=== Done. Piper and Whisper models are ready. ==="
Write-Host "See README-first-run.txt for the remaining models (Kokoro, YOLO, classifier)."

Torch Inference Server — First Run
===================================

This package does not include any AI model files (they would make the
installer several gigabytes). Before starting the server:

1. Run the model-download script bundled next to the binary:
     macOS / Linux:  ./download_models.sh
     Windows:        .\download_models.ps1
   This fetches the Piper TTS and Whisper STT models automatically.

2. Some engines (Kokoro TTS, YOLO detection, image classification) need
   additional model files that are not auto-downloaded by that script.
   See the "Models" section of docs/QUICK_START.md in the project
   repository (https://github.com/Evintkoo/torch-inference) for how to
   obtain them, or fetch them at runtime via the server's own
   POST /yolo/download and similar model-management endpoints once it's
   running.

3. Edit config.toml (installed alongside the binary) to point
   [models] cache_dir at wherever you placed the model files, then start
   the server.

Full documentation: https://github.com/Evintkoo/torch-inference/tree/main/docs

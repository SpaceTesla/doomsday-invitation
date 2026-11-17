#!/usr/bin/env bash
# Encode the synthesised sounds (scripts/make-sounds.py and scripts/make-score.py) for the
# web: WebM/Opus first, MP3 as the fallback (design/DESIGN.md, section 6.11). One-shots in
# mono, the score and the claim and decree sounds in stereo. Runs ffmpeg in Docker, so
# nothing needs installing.
#
# Usage, from web/:  bash scripts/encode-sounds.sh <folder of .wav files>
set -euo pipefail

mkdir -p public/audio
# Absolute paths for Docker volumes (Windows-style under Git Bash, POSIX elsewhere).
src="$(cd "$1"; pwd -W 2>/dev/null || pwd)"
out="$(cd public/audio; pwd -W 2>/dev/null || pwd)"

for wav in "$1"/*.wav; do
  name="$(basename "$wav" .wav)"
  # The score's stems and the claim and decree sounds are stereo (make-score.py); the
  # mechanical one-shots are mono.
  case "$name" in
    score-*) ch=2; opus=64k; mp3=112k ;;
    claim|decree) ch=2; opus=64k; mp3=96k ;;
    hall-room) ch=1; opus=40k; mp3=64k ;;
    *) ch=1; opus=64k; mp3=96k ;;
  esac
  MSYS_NO_PATHCONV=1 docker run --rm -v "$src:/in:ro" -v "$out:/out" jrottenberg/ffmpeg:7.1-alpine \
    -hide_banner -loglevel error -y -i "/in/$name.wav" -ac "$ch" \
    -c:a libopus -b:a "$opus" -vbr on "/out/$name.webm"
  MSYS_NO_PATHCONV=1 docker run --rm -v "$src:/in:ro" -v "$out:/out" jrottenberg/ffmpeg:7.1-alpine \
    -hide_banner -loglevel error -y -i "/in/$name.wav" -ac "$ch" \
    -c:a libmp3lame -b:a "$mp3" "/out/$name.mp3"
  echo "encoded $name"
done

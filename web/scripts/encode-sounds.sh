#!/usr/bin/env bash
# Encode the synthesised sounds (scripts/make-sounds.py) for the web: WebM/Opus first,
# MP3 as the fallback (design/DESIGN.md, section 6.11). Mono; the room tone at a lower
# bitrate. Runs ffmpeg in Docker, so nothing needs installing.
#
# Usage, from web/:  bash scripts/encode-sounds.sh <folder of .wav files>
set -euo pipefail

mkdir -p public/audio
# Absolute paths for Docker volumes (Windows-style under Git Bash, POSIX elsewhere).
src="$(cd "$1"; pwd -W 2>/dev/null || pwd)"
out="$(cd public/audio; pwd -W 2>/dev/null || pwd)"

for wav in "$1"/*.wav; do
  name="$(basename "$wav" .wav)"
  if [ "$name" = "hall-room" ]; then opus=40k; mp3=64k; else opus=64k; mp3=96k; fi
  MSYS_NO_PATHCONV=1 docker run --rm -v "$src:/in:ro" -v "$out:/out" jrottenberg/ffmpeg:7.1-alpine \
    -hide_banner -loglevel error -y -i "/in/$name.wav" -ac 1 \
    -c:a libopus -b:a "$opus" -vbr on "/out/$name.webm"
  MSYS_NO_PATHCONV=1 docker run --rm -v "$src:/in:ro" -v "$out:/out" jrottenberg/ffmpeg:7.1-alpine \
    -hide_banner -loglevel error -y -i "/in/$name.wav" -ac 1 \
    -c:a libmp3lame -b:a "$mp3" "/out/$name.mp3"
  echo "encoded $name"
done

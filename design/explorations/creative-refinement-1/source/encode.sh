#!/usr/bin/env bash
# Encode the review prototypes (source/make_score.py) to WebM/Opus, stereo, into ../audio.
# Runs ffmpeg in Docker, as web/scripts/encode-sounds.sh does, so nothing needs installing.
#
# Usage, from the repository root:
#   bash design/explorations/creative-refinement-1/source/encode.sh <folder of .wav files>
set -euo pipefail

here="$(cd "$(dirname "$0")"; pwd)"
mkdir -p "$here/../audio"
src="$(cd "$1"; pwd -W 2>/dev/null || pwd)"
out="$(cd "$here/../audio"; pwd -W 2>/dev/null || pwd)"

for wav in "$1"/*.wav; do
  name="$(basename "$wav" .wav)"
  case "$name" in
    journey-*|foundation-*|crown-*|hall|motif-*|decree-phrase-*|closing-*) rate=96k ;;
    *) rate=80k ;;
  esac
  MSYS_NO_PATHCONV=1 docker run --rm -v "$src:/in:ro" -v "$out:/out" jrottenberg/ffmpeg:7.1-alpine \
    -hide_banner -loglevel error -y -i "/in/$name.wav" \
    -c:a libopus -b:a "$rate" -vbr on "/out/$name.webm"
  echo "encoded $name"
done

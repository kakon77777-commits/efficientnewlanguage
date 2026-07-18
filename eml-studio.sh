#!/usr/bin/env bash
# EML Studio — launch the EML Workbench in your browser (macOS/Linux).
# Forwards any arguments to the launcher (e.g. ./eml-studio.sh run examples/phase0/sum.eml).
set -e
cd "$(dirname "$0")"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export NODE_NO_WARNINGS=1
exec node scripts/launch.mjs "$@"

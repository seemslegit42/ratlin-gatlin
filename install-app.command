#!/bin/bash
cd "$(dirname "$0")"
export BEEP_OPERATOR=1
exec ./install-app.sh

#!/bin/bash
# Reusable app icons and splash screen generator shell wrapper
set -e

# Execute the robust python branding generator
python3 "$(dirname "$0")/generate_assets.py"

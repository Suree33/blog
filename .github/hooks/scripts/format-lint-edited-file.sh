#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"

result_type="$(echo "$input" | jq -r '.toolResult.resultType // empty')"
tool_name="$(echo "$input" | jq -r '.toolName // empty')"
tool_args_raw="$(echo "$input" | jq -r '.toolArgs // empty')"
event_cwd="$(echo "$input" | jq -r '.cwd // empty')"

if [[ "$result_type" != "success" ]]; then
  exit 0
fi

case "$tool_name" in
  edit | write | create)
    ;;
  *)
    exit 0
    ;;
esac

if ! echo "$tool_args_raw" | jq -e . >/dev/null 2>&1; then
  exit 0
fi

target_path="$(echo "$tool_args_raw" | jq -r '.path // .filePath // .filepath // .target_file // empty')"

if [[ -z "$target_path" ]]; then
  exit 0
fi

target_file="$(
  python3 - "$event_cwd" "$target_path" <<'PY'
from pathlib import Path
import sys

cwd_arg = sys.argv[1]
target = Path(sys.argv[2])

cwd = Path(cwd_arg).resolve() if cwd_arg else Path.cwd().resolve()
print((target if target.is_absolute() else cwd / target).resolve())
PY
)"

if [[ ! -f "$target_file" ]]; then
  exit 0
fi

case "$target_file" in
  *.js | *.mjs | *.cjs | *.jsx | *.ts | *.mts | *.cts | *.tsx | *.astro | *.json | *.md | *.css)
    pnpm exec prettier --write "$target_file"
    ;;
  *)
    exit 0
    ;;
esac

case "$target_file" in
  *.js | *.mjs | *.cjs | *.jsx | *.ts | *.mts | *.cts | *.tsx | *.astro)
    pnpm exec eslint "$target_file"
    ;;
esac

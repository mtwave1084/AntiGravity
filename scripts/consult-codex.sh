#!/usr/bin/env bash
# consult-codex.sh 窶・bash wrapper for codex exec
# Usage: bash scripts/consult-codex.sh "prompt" [sandbox] [add_dirs]
#   add_dirs: comma-separated extra writable directories (e.g. "C:/Users/mt_wa/projects/Starry_hiking")

PROMPT="$1"
SANDBOX="${2:-read-only}"
ADD_DIRS="${3:-}"
CONSULT_DIR="C:/Users/mt_wa/projects/solitaire/.ai-consults"

mkdir -p "$CONSULT_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUT_FILE="$CONSULT_DIR/codex-${TIMESTAMP}.md"

# Header
cat > "$OUT_FILE" <<EOF
# Codex CLI Consultation
date: $(date +%Y-%m-%dT%H:%M:%S)
sandbox: $SANDBOX
add_dirs: $ADD_DIRS
prompt: $PROMPT

---

EOF

CMD_ARGS=("-s" "$SANDBOX" "--ephemeral")
if [ -n "$ADD_DIRS" ]; then
  IFS=',' read -ra DIRS <<< "$ADD_DIRS"
  for d in "${DIRS[@]}"; do
    d_trimmed="$(echo "$d" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    [ -n "$d_trimmed" ] && CMD_ARGS+=("--add-dir" "$d_trimmed")
  done
fi

echo "[orchestrate] Codex CLI 縺ｫ逶ｸ隲・☆繧九ｈ (sandbox: $SANDBOX${ADD_DIRS:+, add-dir: $ADD_DIRS})..."

echo "$PROMPT" | codex exec "${CMD_ARGS[@]}" >> "$OUT_FILE" 2>&1

echo "[orchestrate] 螳御ｺ・竊・$OUT_FILE"
echo "$OUT_FILE"


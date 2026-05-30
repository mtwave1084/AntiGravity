#!/usr/bin/env bash
# consult-antigravity.sh
# Gemini native API (generateContent + Google Search grounding) wo curl de tataku.
# consult-gemini.ps1 / consult-antigravity.ps1 no jittai.
#
# Usage:
#   bash consult-antigravity.sh "prompt text" [model]
#
# Stdout: path of the saved consultation file (one line).
# Stderr: status messages.
#
# Why native (not OpenAI compat):
#   OpenAI gokan endpoint deha google_search grounding ga "client-side function"
#   atsukai ni nari, Gemini ga jidou de kensaku shite kurenai. Native API
#   (/v1beta/models/{model}:generateContent) nara tools:[{"google_search":{}}]
#   de honmono no grounding ga ugoku. AI news no "saishin jouhou wo hirou kakari"
#   to shite ha grounding hissu.
#
# Why bash (not ps1):
#   PowerShell 5.1 + claude code harness no kumiawase de
#   .ps1 script-naka kara native process stdout wo henuu de ukeru to hang suru.
#   Jittai wo .sh ni dasu koto de I/O capture mondai wo sakeru.

set -e
set -u
set -o pipefail

PROMPT="${1:-}"
MODEL="${2:-gemini-3.5-flash}"

if [ -z "$PROMPT" ]; then
  echo "ERROR: prompt is required (arg 1)" >&2
  exit 1
fi

if [ -z "${GEMINI_API_KEY:-}" ]; then
  echo "ERROR: GEMINI_API_KEY is not set" >&2
  exit 1
fi

CONSULT_DIR="C:/Users/mt_wa/projects/solitaire/.ai-consults"
mkdir -p "$CONSULT_DIR"

# PID-suffixed timestamp avoids collisions when running in parallel
TIMESTAMP="$(date +%Y%m%d-%H%M%S)-$$"
OUT_FILE="$CONSULT_DIR/gemini-${TIMESTAMP}.md"
BODY_FILE="$(mktemp -t consult-antigravity-body.XXXXXX.json)"
RESP_FILE="$(mktemp -t consult-antigravity-resp.XXXXXX.json)"

# Always clean BODY_FILE; RESP_FILE is preserved on failure for inspection.
cleanup() {
  rm -f "$BODY_FILE"
}
trap cleanup EXIT

GEMINI_MD="C:/Users/mt_wa/projects/solitaire/GEMINI.md"
if [ -f "$GEMINI_MD" ]; then
  SYSTEM_MSG="$(cat "$GEMINI_MD")"
else
  SYSTEM_MSG="You are a research/summarization/idea expert. Reply in Japanese to research tasks from Claude Code."
fi

# --- Header ---
{
  printf '# Gemini HTTP Consultation\n'
  printf 'date: %s\n' "$(date +%Y-%m-%dT%H:%M:%S)"
  printf 'model: %s\n' "$MODEL"
  printf 'transport: bash + curl -> native generativelanguage (generateContent + google_search grounding)\n'
  printf 'prompt: %s\n' "$PROMPT"
  printf '\n---\n\n'
} > "$OUT_FILE"

echo "[consult-antigravity] Asking Gemini (native, grounded)... (model: $MODEL)" >&2

# --- Build Gemini native body via Python (safe quoting/unicode) ---
PYTHONIOENCODING=utf-8 SYSTEM_MSG="$SYSTEM_MSG" PROMPT="$PROMPT" python -c '
import json, os, sys
body = {
    "contents": [
        {"role": "user", "parts": [{"text": os.environ["PROMPT"]}]},
    ],
    "systemInstruction": {
        "parts": [{"text": os.environ["SYSTEM_MSG"]}],
    },
    "tools": [
        {"google_search": {}},
    ],
}
sys.stdout.write(json.dumps(body, ensure_ascii=False))
' > "$BODY_FILE"

ENDPOINT="https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}"

# --- POST with one retry on 503 (Gemini occasionally returns "high demand") ---
do_request() {
  curl \
    --silent \
    --show-error \
    --max-time 180 \
    --write-out '%{http_code}' \
    --output "$RESP_FILE" \
    -X POST \
    -H "Content-Type: application/json; charset=utf-8" \
    --data-binary "@$BODY_FILE" \
    "$ENDPOINT" \
    2>/dev/null || echo "000"
}

HTTP_STATUS="$(do_request)"
if [ "$HTTP_STATUS" = "503" ]; then
  echo "[consult-antigravity] 503 high-demand; retrying once after 3s..." >&2
  sleep 3
  HTTP_STATUS="$(do_request)"
fi

if [ "$HTTP_STATUS" != "200" ]; then
  {
    printf 'ERROR: HTTP %s\n\n' "$HTTP_STATUS"
    printf 'Response body:\n'
    cat "$RESP_FILE" 2>/dev/null || echo "(no response body)"
  } >> "$OUT_FILE"
  echo "[consult-antigravity] HTTP $HTTP_STATUS 窶・saved error to $OUT_FILE (resp kept: $RESP_FILE)" >&2
  echo "$OUT_FILE"
  exit 1
fi

# --- Parse Gemini native response with Python ---
PYTHONIOENCODING=utf-8 RESP_PATH="$(cygpath -w "$RESP_FILE")" python -c '
import json, os, sys

with open(os.environ["RESP_PATH"], encoding="utf-8") as f:
    d = json.load(f)

candidates = d.get("candidates") or []
if not candidates:
    sys.stdout.write("(empty response 窶・no candidates in API reply)\n")
    pf = d.get("promptFeedback") or {}
    if pf:
        sys.stdout.write(f"\npromptFeedback: {json.dumps(pf, ensure_ascii=False)}\n")
    sys.exit(0)

cand = candidates[0]
parts = (cand.get("content") or {}).get("parts") or []
text_pieces = [p.get("text") for p in parts if p.get("text")]
if text_pieces:
    sys.stdout.write("\n".join(text_pieces))
else:
    sys.stdout.write("(empty response 窶・content had no text parts; finishReason: "
                     + str(cand.get("finishReason")) + ")")

# Grounding metadata (citations)
gm = cand.get("groundingMetadata") or {}
chunks = gm.get("groundingChunks") or []
queries = gm.get("webSearchQueries") or []

if chunks or queries:
    sys.stdout.write("\n\n---\n\n## Grounding sources\n\n")
    for i, ch in enumerate(chunks, 1):
        w = ch.get("web") or {}
        title = w.get("title", "(no title)")
        uri = w.get("uri", "")
        sys.stdout.write(f"{i}. [{title}]({uri})\n")
    if queries:
        sys.stdout.write("\n### Search queries used\n\n")
        for q in queries:
            sys.stdout.write(f"- {q}\n")

# Usage
usage = d.get("usageMetadata") or {}
pt = usage.get("promptTokenCount", "?")
ct = usage.get("candidatesTokenCount", "?")
tt = usage.get("totalTokenCount", "?")
fr = cand.get("finishReason", "?")
sys.stdout.write("\n\n---\n\n## Usage\n")
sys.stdout.write(f"- prompt_tokens: {pt}\n")
sys.stdout.write(f"- candidates_tokens: {ct}\n")
sys.stdout.write(f"- total_tokens: {tt}\n")
sys.stdout.write(f"- finish_reason: {fr}\n")
' >> "$OUT_FILE"

# Success: drop the response temp
rm -f "$RESP_FILE"

echo "[consult-antigravity] Done -> $OUT_FILE" >&2
echo "$OUT_FILE"


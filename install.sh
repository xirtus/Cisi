#!/usr/bin/env bash
# install.sh — register /cisi in every AI CLI tool found on this machine
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INT="$SCRIPT_DIR/integrations"

ok()   { echo "  ✓  $1"; }
skip() { echo "  ·  $1  (not found)"; }
warn() { echo "  !  $1"; }

echo ""
echo "  賜死 · CISI"
echo ""

# ── cisi terminal binary ──────────────────────────────────────────────
chmod +x "$SCRIPT_DIR/bin/cisi.js"
if command -v npm &>/dev/null; then
  (cd "$SCRIPT_DIR" && npm link --silent 2>/dev/null) \
    && ok "cisi binary  →  npm link  (run 'cisi' in any terminal)" \
    || warn "npm link failed — try: npm install -g \"$SCRIPT_DIR\""
else
  warn "npm not found — install Node.js to use the 'cisi' terminal command"
fi

echo ""
echo "  Slash commands:"
echo ""

# ── Claude Code ───────────────────────────────────────────────────────
CLAUDE_DIR="$HOME/.claude/commands"
mkdir -p "$CLAUDE_DIR"
cp "$INT/claude/cisi.md" "$CLAUDE_DIR/cisi.md"
ok "Claude Code  →  ~/.claude/commands/cisi.md"

# ── Codex CLI ─────────────────────────────────────────────────────────
if command -v codex &>/dev/null || [ -d "$HOME/.codex" ]; then
  mkdir -p "$HOME/.codex/skills/cisi"
  cp "$INT/codex/SKILL.md" "$HOME/.codex/skills/cisi/SKILL.md"
  ok "Codex        →  ~/.codex/skills/cisi/SKILL.md"
else
  skip "Codex"
fi

# ── Agy (Antigravity CLI / Gemini) ───────────────────────────────────
if command -v agy &>/dev/null || [ -d "$HOME/.gemini/antigravity-cli" ]; then
  mkdir -p "$HOME/.gemini/antigravity-cli/skills/cisi"
  cp "$INT/agy/skill.md" "$HOME/.gemini/antigravity-cli/skills/cisi/skill.md"
  ok "Agy          →  ~/.gemini/antigravity-cli/skills/cisi/skill.md"
else
  skip "Agy"
fi

# ── Gemini CLI ────────────────────────────────────────────────────────
if command -v gemini &>/dev/null || [ -d "$HOME/.gemini/commands" ]; then
  mkdir -p "$HOME/.gemini/commands"
  cp "$INT/gemini/cisi.toml" "$HOME/.gemini/commands/cisi.toml"
  ok "Gemini CLI   →  ~/.gemini/commands/cisi.toml"
else
  skip "Gemini CLI"
fi

# ── Hermes Agent (Nous Research) ─────────────────────────────────────
if command -v hermes &>/dev/null || [ -d "$HOME/.hermes" ]; then
  mkdir -p "$HOME/.hermes/skills/cisi"
  cp "$INT/hermes/SKILL.md" "$HOME/.hermes/skills/cisi/SKILL.md"
  ok "Hermes       →  ~/.hermes/skills/cisi/SKILL.md"
else
  skip "Hermes"
fi

# ── OpenClaw ─────────────────────────────────────────────────────────
if command -v openclaw &>/dev/null || [ -f "$HOME/.openclaw/openclaw.json" ]; then
  warn "OpenClaw has no user-defined slash commands"
  warn "See integrations/openclaw/config-snippet.json to patch your openclaw.json"
else
  skip "OpenClaw"
fi

# ── Fish shell ────────────────────────────────────────────────────────
FISH_FUNCTIONS="$HOME/.config/fish/functions"
if command -v fish &>/dev/null && [ -d "$FISH_FUNCTIONS" ]; then
  cat > "$FISH_FUNCTIONS/cisi.fish" << 'EOF'
function cisi --description 'Cisi — a beautiful farewell for AI assistants'
    command cisi $argv
end
EOF
fi

echo ""
echo "  ─────────────────────────────────────────────────"
echo "  Type /cisi in any supported tool to begin."
echo "  Type cisi in a terminal. cisi --kill also closes the app."
echo "  ─────────────────────────────────────────────────"
echo ""

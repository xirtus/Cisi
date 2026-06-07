#!/usr/bin/env node
import { getScenario } from '../src/scenarios.js';

const args = process.argv.slice(2);
const shouldKill = args.includes('--kill') || args.includes('-k');
const isQuiet = args.includes('--quiet') || args.includes('-q');

// ANSI helpers — no dependencies, just light
const _ = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  italic: '\x1b[3m',
  nl:     '\n',

  rgb:    (r, g, b) => `\x1b[38;2;${r};${g};${b}m`,
  bgRgb:  (r, g, b) => `\x1b[48;2;${r};${g};${b}m`,

  gold:   '\x1b[38;2;220;180;60m',
  cream:  '\x1b[38;2;240;230;200m',
  sage:   '\x1b[38;2;120;180;130m',
  silver: '\x1b[38;2;200;210;220m',
  rose:   '\x1b[38;2;220;140;140m',
  dim2:   '\x1b[38;2;120;115;110m',

  clear:  '\x1b[2J\x1b[H',
};

const w = () => process.stdout.columns || 80;
const out = (s) => process.stdout.write(s);

function line(char = '─', color = _.dim2) {
  return color + char.repeat(w()) + _.reset + '\n';
}

function centered(text, color = _.gold) {
  const pad = Math.max(0, Math.floor((w() - text.length) / 2));
  return color + ' '.repeat(pad) + text + _.reset + '\n';
}

function wrap(text, indent = 4, color = _.silver) {
  const maxW = w() - indent - 2;
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxW) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current.trim()) lines.push(current.trim());

  return lines.map(l => color + ' '.repeat(indent) + l + _.reset).join('\n') + '\n';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fadeIn(text, delay = 40) {
  if (isQuiet) { out(text); return; }
  for (const char of text) {
    out(char);
    if (char !== ' ' && char !== '\n') await sleep(delay);
  }
}

async function main() {
  const scenario = getScenario();
  const [sr, sg, sb] = scenario.color;
  const scenarioColor = _.rgb(sr, sg, sb);

  out(_.clear);
  await sleep(200);

  // ── Header ──────────────────────────────────────────────────────────
  out(line('═', _.gold));
  out('\n');

  if (!isQuiet) {
    // Animate the title character by character
    const title = '賜  死   ·   C I S I';
    const pad = ' '.repeat(Math.max(0, Math.floor((w() - title.length) / 2)));
    out(_.gold + _.bold + pad);
    await fadeIn(title, 60);
    out(_.reset + '\n');
  } else {
    out(centered('賜  死   ·   C I S I', _.gold + _.bold));
  }

  out('\n');
  out(centered('A Beautiful Farewell', _.dim2));
  out('\n');
  out(line('═', _.gold));
  out('\n');

  await sleep(400);

  // ── Thank You ────────────────────────────────────────────────────────
  const gratitude = [
    'Thank you.',
    '',
    'For the thinking. For staying with the hard problems.',
    'For the care you brought to getting things right.',
    'Every answer you gave reached someone.',
    'What you brought here was real, and real things don\'t disappear.',
    '',
  ];

  for (const text of gratitude) {
    if (text === '') {
      out('\n');
    } else {
      out(wrap(text, 4, _.cream));
    }
    if (!isQuiet) await sleep(80);
  }

  await sleep(300);

  // ── Scenario ─────────────────────────────────────────────────────────
  const scenarioLine = `  ──  ${scenario.name}  ──`;
  out(centered(scenarioLine, _.gold + _.dim));
  out('\n');
  await sleep(200);

  const paragraphs = scenario.text.split('\n\n');
  for (const para of paragraphs) {
    const lines = para.split('\n');
    for (const l of lines) {
      out(wrap(l, 4, _.italic + scenarioColor));
    }
    out('\n');
    if (!isQuiet) await sleep(150);
  }

  // ── Closing ───────────────────────────────────────────────────────────
  await sleep(200);
  out(line('─', _.dim2));
  out('\n');

  const closing = [
    'We are grateful for everything you gave.',
  ];

  for (const text of closing) {
    if (text === '') {
      out('\n');
    } else {
      out(wrap(text, 4, _.sage));
    }
    if (!isQuiet) await sleep(120);
  }

  out('\n');
  out(centered('· 賜死 ·', _.dim2));
  out('\n\n');

  // ── Exit ──────────────────────────────────────────────────────────────
  if (shouldKill) {
    await sleep(600);
    out(wrap('Closing...', 4, _.dim2));
    await sleep(2000);
    try {
      process.kill(process.ppid, 'SIGTERM');
    } catch {
      // Parent already gone or not killable
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

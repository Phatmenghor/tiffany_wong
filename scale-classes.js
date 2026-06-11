#!/usr/bin/env node
/**
 * Scale Tailwind size classes by ×0.65 across all component files.
 *
 * Rules:
 *  - Replaces standard rem-based Tailwind classes with explicit arbitrary values.
 *  - Decimal entries (e.g. 1.5) are replaced BEFORE their integer prefixes (e.g. 1)
 *    to avoid partial matches like h-1 inside h-1.5.
 *  - Lookaheads block matching when a digit is followed by '.' or '/' so that
 *    w-1/2 (percentage) and h-1.5 (not yet replaced) are not corrupted.
 *  - globals.css and tailwind.config.ts are explicitly skipped.
 */

const fs = require('fs');
const path = require('path');

// Skip these files — handled separately
const SKIP_FILES = new Set([
  'styles/globals.css',
  'tailwind.config.ts',
]);

// ─── Spacing mapping: [rawValue, scaledRem] ──────────────────────────────────
// DECIMAL entries MUST come before their integer prefix so regex ordering is safe.
const spacingEntries = [
  // Decimals first
  ['0.5',  '0.08125rem'],
  ['1.5',  '0.24375rem'],
  ['2.5',  '0.40625rem'],
  ['3.5',  '0.56875rem'],
  // Integers
  ['1',    '0.1625rem'],
  ['2',    '0.325rem'],
  ['3',    '0.4875rem'],
  ['4',    '0.65rem'],
  ['5',    '0.8125rem'],
  ['6',    '0.975rem'],
  ['7',    '1.1375rem'],
  ['8',    '1.3rem'],
  ['9',    '1.4625rem'],
  ['10',   '1.625rem'],
  ['11',   '1.7875rem'],
  ['12',   '1.95rem'],
  ['14',   '2.275rem'],
  ['16',   '2.6rem'],
  ['20',   '3.25rem'],
  ['24',   '3.9rem'],
  ['28',   '4.55rem'],
  ['32',   '5.2rem'],
  ['36',   '5.85rem'],
  ['40',   '6.5rem'],
  ['44',   '7.15rem'],
  ['48',   '7.8rem'],
  ['52',   '8.45rem'],
  ['56',   '9.1rem'],
  ['60',   '9.75rem'],
  ['64',   '10.4rem'],
  ['72',   '11.7rem'],
  ['80',   '13rem'],
  ['96',   '15.6rem'],
];

// Prefixes that consume the spacing scale (longest first to avoid prefix shadowing)
const spacingPrefixes = [
  'scroll-mx', 'scroll-my', 'scroll-mt', 'scroll-mb', 'scroll-ml', 'scroll-mr',
  'scroll-px', 'scroll-py', 'scroll-pt', 'scroll-pb', 'scroll-pl', 'scroll-pr',
  'scroll-m', 'scroll-p',
  'translate-x', 'translate-y',
  'inset-x', 'inset-y',
  'gap-x', 'gap-y',
  'space-x', 'space-y',
  'min-w', 'max-w', 'min-h', 'max-h',
  'px', 'py', 'pt', 'pb', 'pl', 'pr',
  'mx', 'my', 'mt', 'mb', 'ml', 'mr',
  'inset', 'basis', 'size',
  'p', 'm', 'gap',
  'top', 'right', 'bottom', 'left',
  'w', 'h',
];

// ─── Font-size mapping ────────────────────────────────────────────────────────
const fontSizeEntries = [
  ['9xl',  '5.2rem'],
  ['8xl',  '3.9rem'],
  ['7xl',  '2.925rem'],
  ['6xl',  '2.4375rem'],
  ['5xl',  '1.95rem'],
  ['4xl',  '1.4625rem'],
  ['3xl',  '1.21875rem'],
  ['2xl',  '0.975rem'],
  ['base', '0.65rem'],
  ['xl',   '0.8125rem'],
  ['lg',   '0.73125rem'],
  ['sm',   '0.56875rem'],
  ['xs',   '0.4875rem'],
];

// ─── Line-height (numeric only) ───────────────────────────────────────────────
const lineHeightEntries = [
  ['10', '1.625rem'],
  ['9',  '1.4625rem'],
  ['8',  '1.3rem'],
  ['7',  '1.1375rem'],
  ['6',  '0.975rem'],
  ['5',  '0.8125rem'],
  ['4',  '0.65rem'],
  ['3',  '0.4875rem'],
];

// ─── Border-radius (only xl/2xl/3xl — lg/md/sm use var(--radius) from config) ─
const roundedEntries = [
  ['3xl', '0.975rem'],
  ['2xl', '0.65rem'],
  ['xl',  '0.4875rem'],
];
const roundedSides = ['', '-t', '-r', '-b', '-l', '-tl', '-tr', '-bl', '-br', '-s', '-e', '-ss', '-se', '-es', '-ee'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a regex for a Tailwind class token.
 *
 * Lookbehind: not preceded by word char or '-' (so we don't match inside another class).
 * Lookahead:  not followed by word char, '[', '.', or '/' (blocks decimals & fractions).
 */
function classRe(prefix, value) {
  const ep = prefix.replace(/[-]/g, '\\-');
  // Escape the value: only '.' needs escaping in this context
  const ev = value.replace(/\./g, '\\.');
  // Positive lookahead for end: not a word char, not '[', not '.', not '/'
  return new RegExp(`(?<![\\w])${ep}-${ev}(?![\\w\\[./])`, 'g');
}

// ─── Build ordered replacement list ──────────────────────────────────────────
const replacements = [];

// Font sizes (longest keys like 9xl first so `2xl` doesn't eat `text-2xl` partially — not strictly needed but safe)
for (const [key, val] of fontSizeEntries) {
  const ek = key.replace(/[-]/g, '\\-');
  replacements.push({ from: new RegExp(`(?<![\\w])text-${ek}(?![\\w\\[./])`, 'g'), to: `text-[${val}]` });
}

// Line heights
for (const [key, val] of lineHeightEntries) {
  replacements.push({ from: classRe('leading', key), to: `leading-[${val}]` });
}

// Rounded xl/2xl/3xl with optional directional suffix
for (const [key, val] of roundedEntries) {
  const ek = key.replace(/[-]/g, '\\-');
  for (const side of roundedSides) {
    const es = side.replace(/[-]/g, '\\-');
    replacements.push({
      from: new RegExp(`(?<![\\w])rounded${es}-${ek}(?![\\w\\[./])`, 'g'),
      to: `rounded${side}-[${val}]`,
    });
  }
}

// Plain `rounded` (no size, no directional — 0.25rem → 0.1625rem)
// Must NOT be followed by '-' (would start rounded-lg etc.), word char, or '['.
replacements.push({ from: /(?<!\w)rounded(?![-\w[])/g, to: 'rounded-[0.1625rem]' });
// Directional rounded without size: rounded-t, rounded-r, etc. → rounded-{side}-[0.1625rem]
// These are less common; skip to reduce noise.

// Spacing: iterate prefixes (already longest-first) × values (decimals before integers)
for (const prefix of spacingPrefixes) {
  for (const [val, scaledVal] of spacingEntries) {
    // Positive
    replacements.push({ from: classRe(prefix, val), to: `${prefix}-[${scaledVal}]` });
    // Negative (e.g. -mt-4 → -mt-[0.65rem])
    const ep = prefix.replace(/[-]/g, '\\-');
    const ev = val.replace(/\./g, '\\.');
    replacements.push({
      from: new RegExp(`(?<![\\w])-${ep}-${ev}(?![\\w\\[./])`, 'g'),
      to: `-${prefix}-[${scaledVal}]`,
    });
  }
}

// ─── Process files ────────────────────────────────────────────────────────────
const BASE = path.join(__dirname, 'tiffany-frontend', 'src');

function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      results.push(...walkDir(full));
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

const files = walkDir(BASE);
const changedFiles = [];
let totalReplacements = 0;

for (const filePath of files) {
  const rel = path.relative(BASE, filePath);
  if (SKIP_FILES.has(rel)) continue;

  let src = fs.readFileSync(filePath, 'utf8');
  let changed = src;

  for (const { from, to } of replacements) {
    const next = changed.replace(from, to);
    if (next !== changed) totalReplacements++;
    changed = next;
  }

  if (changed !== src) {
    fs.writeFileSync(filePath, changed, 'utf8');
    changedFiles.push(rel);
  }
}

console.log(`\nReplacement passes applied: ${replacements.length}`);
console.log(`Files changed: ${changedFiles.length}`);
console.log(`\nChanged files:`);
changedFiles.forEach(f => console.log('  ' + f));

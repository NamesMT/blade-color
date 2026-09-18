#!/usr/bin/env node
/**
 * Validates the extension manifest and every contributed theme.
 *
 * - package.json must be strict JSON.
 * - Theme files are JSONC (VS Code permits comments and trailing commas); they
 *   are parsed with jsonc-parser exactly the way VS Code reads them.
 * - Checks theme structure (name/tokenColors) and that every `include` chain
 *   resolves to a file that exists inside themes/.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const themesDir = join(root, 'themes');
const { parseTree, findNodeAtLocation, getNodeValue, printParseErrorCode } =
  require('jsonc-parser');

const readText = (abs) => readFileSync(abs, 'utf8');

// Parse a JSONC document; throws on any syntax error, returns the AST root.
function parseJsonc(text, label) {
  const errors = [];
  const node = parseTree(text, errors, { allowTrailingComma: true });
  if (errors.length > 0) {
    throw new Error(`${label}: ${printParseErrorCode(errors[0].error)} (offset ${errors[0].offset})`);
  }
  return node;
}

const at = (node, path) => {
  const found = findNodeAtLocation(node, path);
  return found === undefined ? undefined : getNodeValue(found);
};

// 1. Manifest.
const pkg = JSON.parse(readText(join(root, 'package.json')));
for (const key of ['name', 'version', 'publisher', 'engines', 'contributes']) {
  if (!(key in pkg)) throw new Error(`package.json is missing "${key}"`);
}
console.log('\u2713 valid JSON   package.json');

const themes = pkg.contributes?.themes;
if (!Array.isArray(themes) || themes.length === 0) {
  throw new Error('package.json contributes no themes');
}

// 2. Every theme file must be valid JSONC.
const themeFiles = readdirSync(themesDir).filter((f) => f.endsWith('.json'));
for (const f of themeFiles) {
  parseJsonc(readText(join(themesDir, f)), `themes/${f}`);
}
console.log(`\u2713 valid JSONC  ${themeFiles.length}/${themeFiles.length} theme files`);

// 3. Structure + include-chain resolution per contributed theme.
for (const theme of themes) {
  const node = parseJsonc(readText(join(root, theme.path)), theme.path);
  const name = at(node, ['name']);
  if (typeof name !== 'string') throw new Error(`${theme.path} is missing "name"`);

  const tokenColors = at(node, ['tokenColors']);
  if (!Array.isArray(tokenColors)) throw new Error(`${theme.path} is missing a "tokenColors" array`);
  for (const [i, tc] of tokenColors.entries()) {
    if (!tc || typeof tc !== 'object' || !('scope' in tc)) {
      throw new Error(`${theme.path} tokenColors[${i}] missing "scope"`);
    }
    if (!tc.settings || typeof tc.settings !== 'object') {
      throw new Error(`${theme.path} tokenColors[${i}] missing "settings"`);
    }
  }

  // Walk the include chain relative to the including file's directory.
  let abs = resolve(join(root, theme.path));
  const seen = new Set();
  for (;;) {
    if (seen.has(abs)) throw new Error(`circular include chain at "${abs}"`);
    seen.add(abs);
    const current = parseJsonc(readText(abs), abs);
    const include = at(current, ['include']);
    if (typeof include !== 'string') break;
    abs = resolve(dirname(abs), include);
    if (!existsSync(abs)) throw new Error(`${theme.path} includes missing file "${include}"`);
  }
  console.log(`\u2713 theme "${name}" (${theme.path})`);
}

console.log('All checks passed.');

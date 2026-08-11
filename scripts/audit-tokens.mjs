#!/usr/bin/env node
/**
 * Falha se o código referenciar um token `--cp-*` que o design system não
 * declara.
 *
 * Isto existe porque `@constructpluseu/tokens` usa o mesmo prefixo `--cp-` que
 * o CSS local, e um `var()` para um token inexistente não dá erro em lado
 * nenhum: a declaração é simplesmente descartada e a propriedade herda. O
 * resultado é texto sem cor ou fundos transparentes que só se notam a olho, e
 * só num dos temas.
 *
 * Nota: o próprio design system 1.0.0 referencia
 * `--cp-color-semantic-accent-default`, que não declara. Se uma versão futura
 * o corrigir, este script deixa de o assinalar sozinho.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TOKENS_CSS = 'node_modules/@constructpluseu/tokens/dist/css/tokens.css';

/** Tokens que declaramos de propósito — ver o cabeçalho de src/styles/global.css. */
const LOCAL_OVERRIDES = new Set(['--cp-font-family-base']);

const tokensPath = path.join(ROOT, TOKENS_CSS);
if (!fs.existsSync(tokensPath)) {
  console.error(`Não encontrei ${TOKENS_CSS}. Correr "npm install" primeiro.`);
  process.exit(1);
}

const declared = new Set(
  [...fs.readFileSync(tokensPath, 'utf8').matchAll(/(--cp-[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
);

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(entry.name)) files.push(p);
  }
})(path.join(ROOT, 'src'));

const used = new Map();
for (const file of files) {
  for (const m of fs.readFileSync(file, 'utf8').matchAll(/var\((--cp-[a-z0-9-]+)/g)) {
    const name = m[1];
    // `var(--cp-…-${x}-bg)` num template literal deixa um prefixo truncado;
    // o nome completo só existe em runtime, por isso não é verificável aqui.
    if (name.endsWith('-')) continue;
    if (!used.has(name)) used.set(name, new Set());
    used.get(name).add(path.relative(ROOT, file).split(path.sep).join('/'));
  }
}

const dead = [...used.keys()].filter((t) => !declared.has(t) && !LOCAL_OVERRIDES.has(t));

if (dead.length === 0) {
  console.log(`✓ ${used.size} tokens referenciados, todos declarados pelo design system.`);
  process.exit(0);
}

console.error(`✗ ${dead.length} referência(s) a tokens inexistentes:\n`);
for (const token of dead) {
  console.error(`  ${token}`);
  for (const file of used.get(token)) console.error(`    ${file}`);
}
console.error('\nUsar um token declarado em @constructpluseu/tokens.');
process.exit(1);

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WarmWindowPreview } from './WarmWindowPreview';

test('renders one current action and one primary call to action', () => {
  const html = renderToStaticMarkup(createElement(WarmWindowPreview));

  assert.match(html, /推进/);
  assert.match(html, /现在只做这一步/);
  assert.match(html, /核对待产包的洗护用品/);
  assert.match(html, /FIXED/);
  assert.equal((html.match(/data-current-action=/g) ?? []).length, 1);
  assert.equal((html.match(/data-primary-action=/g) ?? []).length, 1);
});

test('renders three text-labelled energy choices with one selected', () => {
  const html = renderToStaticMarkup(createElement(WarmWindowPreview));

  assert.equal((html.match(/aria-pressed=/g) ?? []).length, 3);
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1);
  assert.match(html, /较少/);
  assert.match(html, /一般/);
  assert.match(html, /较多/);
});

test('ships the responsive shell, touch target, and reduced-motion contract', () => {
  const css = fs.readFileSync(new URL('./warm-window-preview.css', import.meta.url), 'utf8');

  assert.match(css, /--warm-window-paper:\s*#FAF7F0/i);
  assert.match(css, /max-width:\s*480px/i);
  assert.match(css, /min-height:\s*44px/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/i);
  assert.doesNotMatch(
    css,
    /\.warm-window-[^{]+{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\([23]/is,
  );
});

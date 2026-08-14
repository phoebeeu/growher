import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PreviewGate } from './PreviewGate';

test('renders the warm-window sample for its preview query', () => {
  const html = renderToStaticMarkup(createElement(
    PreviewGate,
    { search: '?preview=warm-window' },
    createElement('p', { 'data-product-home': true }, '现有产品'),
  ));

  assert.match(html, /现在只做这一步/);
  assert.doesNotMatch(html, /data-product-home/);
});

test('renders the existing product for all other queries', () => {
  const html = renderToStaticMarkup(createElement(
    PreviewGate,
    { search: '' },
    createElement('p', { 'data-product-home': true }, '现有产品'),
  ));

  assert.match(html, /data-product-home="true"/);
  assert.doesNotMatch(html, /现在只做这一步/);
});

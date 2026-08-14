import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomeHeader } from './HomeHeader';

test('mobile menu exposes an accessible collapsed navigation target', () => {
  const html = renderToStaticMarkup(createElement(HomeHeader, {
    pregnancyWeek: 21,
    dateLabel: '8 月 11 日 · 周二',
    onOpenProfile: () => undefined,
    onOpenFlow: () => undefined,
  }));

  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="home-mobile-menu"/);
  assert.match(html, /id="home-mobile-menu"/);
  assert.match(html, /hidden=""/);
  assert.match(html, /孕 21 周/);
  assert.match(html, /8 月 11 日 · 周二/);
  assert.match(html, /打开个人资料/);
  assert.match(html, /aria-haspopup="dialog"/);
});

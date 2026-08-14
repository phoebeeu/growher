import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TodayBroadcastPanel } from './TodayBroadcastPanel';

test('renders the pregnancy week and day supplied by the homepage', () => {
  const html = renderToStaticMarkup(createElement(TodayBroadcastPanel, {
    pregnancyWeek: 21,
    pregnancyDay: 4,
    energy: 2,
    availableMinutes: 45,
    checkinCount: 1,
    taskCount: 2,
    totalMinutes: 45,
    explanation: '测试建议',
  }));

  assert.match(html, />21 <em>周<\/em>/);
  assert.match(html, /\+ 4 天/);
});

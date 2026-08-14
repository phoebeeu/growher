import test from 'node:test';
import assert from 'node:assert/strict';
import { isWarmWindowPreview } from './warmWindowMode';

test('shows the preview only for the exact warm-window value', () => {
  assert.equal(isWarmWindowPreview('?preview=warm-window'), true);
  assert.equal(isWarmWindowPreview('?preview=other'), false);
  assert.equal(isWarmWindowPreview(''), false);
});

test('preserves unrelated query parameters', () => {
  assert.equal(isWarmWindowPreview('?mode=demo&preview=warm-window'), true);
});

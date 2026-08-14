import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createDefaultProfile } from '../../home/profile';
import { ProfileEditor } from './ProfileEditor';

const props = {
  profile: createDefaultProfile('2026-08-11'),
  today: '2026-08-11',
  onClose: () => undefined,
  onSave: () => undefined,
};

test('open editor exposes an accessible dialog and profile fields', () => {
  const html = renderToStaticMarkup(createElement(ProfileEditor, { ...props, open: true }));

  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /称呼/);
  assert.match(html, /预产期/);
  assert.match(html, /手动校正孕周/);
  assert.match(html, /保存资料/);
});

test('closed editor does not render a dialog', () => {
  const html = renderToStaticMarkup(createElement(ProfileEditor, { ...props, open: false }));

  assert.equal(html, '');
});

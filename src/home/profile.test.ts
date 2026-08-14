import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PregnancyProfile,
  calculatePregnancyProgress,
  createDefaultProfile,
  readProfile,
  validateProfile,
  writeProfile,
} from './profile';

test('calculates pregnancy week and day from due date', () => {
  const profile = createDefaultProfile('2026-08-11');

  const result = calculatePregnancyProgress(profile, '2026-08-11');

  assert.deepEqual(result, { week: 18, day: 3, totalDays: 129, source: 'dueDate' });
});

test('manual correction continues to advance after the correction date', () => {
  const profile: PregnancyProfile = {
    displayName: '悦桐',
    dueDate: '2027-01-09',
    manualCorrection: true,
    correctedWeek: 20,
    correctedDay: 2,
    correctedAt: '2026-08-11',
  };

  const result = calculatePregnancyProgress(profile, '2026-08-14');

  assert.deepEqual(result, { week: 20, day: 5, totalDays: 145, source: 'manual' });
});

test('rejects an empty name and out-of-range manual correction values', () => {
  const errors = validateProfile({
    displayName: '',
    dueDate: '2027-01-09',
    manualCorrection: true,
    correctedWeek: 43,
    correctedDay: 7,
    correctedAt: '2026-08-11',
  }, '2026-08-11');

  assert.equal(errors.displayName, '请输入称呼');
  assert.equal(errors.correctedWeek, '孕周需在 0–42 之间');
  assert.equal(errors.correctedDay, '天数需在 0–6 之间');
});

test('rejects a due date that produces an impossible pregnancy age', () => {
  const errors = validateProfile({
    displayName: '悦桐',
    dueDate: '2028-01-01',
    manualCorrection: false,
  }, '2026-08-11');

  assert.equal(errors.dueDate, '预产期与当前孕周不匹配，请检查日期');
});

test('falls back to defaults when stored JSON is invalid', () => {
  const storage = {
    getItem: () => '{bad json',
    setItem: () => undefined,
  };

  assert.deepEqual(readProfile(storage, '2026-08-11'), createDefaultProfile('2026-08-11'));
});

test('writes and reads a valid profile using the versioned storage key', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  const profile: PregnancyProfile = {
    displayName: '小雨',
    dueDate: '2027-01-09',
    manualCorrection: false,
  };

  writeProfile(storage, profile);

  assert.deepEqual(readProfile(storage, '2026-08-11'), profile);
  assert.equal(values.has('pregnancy-goal-assistant.profile.v1'), true);
});

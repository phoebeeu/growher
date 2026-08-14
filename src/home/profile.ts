export interface PregnancyProfile {
  displayName: string;
  dueDate: string;
  manualCorrection: boolean;
  correctedWeek?: number;
  correctedDay?: number;
  correctedAt?: string;
}

export interface PregnancyProgress {
  week: number;
  day: number;
  totalDays: number;
  source: 'dueDate' | 'manual';
}

export interface ProfileErrors {
  displayName?: string;
  dueDate?: string;
  correctedWeek?: string;
  correctedDay?: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const PROFILE_STORAGE_KEY = 'pregnancy-goal-assistant.profile.v1';

const DAY_MS = 86_400_000;
const MAX_TOTAL_DAYS = 42 * 7 + 6;

function utcDay(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

function isDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

function rawPregnancyDays(profile: PregnancyProfile, today: string): number {
  if (profile.manualCorrection) {
    const correctedTotal = (profile.correctedWeek ?? 0) * 7 + (profile.correctedDay ?? 0);
    const elapsedDays = profile.correctedAt ? utcDay(today) - utcDay(profile.correctedAt) : 0;
    return correctedTotal + elapsedDays;
  }
  return 280 - (utcDay(profile.dueDate) - utcDay(today));
}

function dateFromUtcDay(dayNumber: number): string {
  return new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);
}

function toProgress(totalDays: number, source: PregnancyProgress['source']): PregnancyProgress {
  const clamped = Math.min(MAX_TOTAL_DAYS, Math.max(0, totalDays));
  return {
    week: Math.floor(clamped / 7),
    day: clamped % 7,
    totalDays: clamped,
    source,
  };
}

export function createDefaultProfile(today: string): PregnancyProfile {
  return {
    displayName: '悦桐',
    dueDate: dateFromUtcDay(utcDay(today) + 151),
    manualCorrection: false,
  };
}

export function calculatePregnancyProgress(profile: PregnancyProfile, today: string): PregnancyProgress {
  if (profile.manualCorrection) {
    return toProgress(rawPregnancyDays(profile, today), 'manual');
  }

  return toProgress(rawPregnancyDays(profile, today), 'dueDate');
}

export function validateProfile(profile: PregnancyProfile, today: string): ProfileErrors {
  const errors: ProfileErrors = {};
  const name = profile.displayName.trim();

  if (!name) errors.displayName = '请输入称呼';
  else if (name.length > 12) errors.displayName = '称呼不能超过 12 个字符';

  if (!isDateString(profile.dueDate)) {
    errors.dueDate = '请选择预产期';
  } else if (!profile.manualCorrection) {
    const totalDays = rawPregnancyDays(profile, today);
    if (totalDays < 0 || totalDays > MAX_TOTAL_DAYS) {
      errors.dueDate = '预产期与当前孕周不匹配，请检查日期';
    }
  }

  if (profile.manualCorrection) {
    if (!Number.isInteger(profile.correctedWeek) || profile.correctedWeek! < 0 || profile.correctedWeek! > 42) {
      errors.correctedWeek = '孕周需在 0–42 之间';
    }
    if (!Number.isInteger(profile.correctedDay) || profile.correctedDay! < 0 || profile.correctedDay! > 6) {
      errors.correctedDay = '天数需在 0–6 之间';
    }
  }

  return errors;
}

function isPregnancyProfile(value: unknown, today: string): value is PregnancyProfile {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as PregnancyProfile;
  if (typeof candidate.displayName !== 'string'
    || typeof candidate.dueDate !== 'string'
    || typeof candidate.manualCorrection !== 'boolean') return false;
  if (candidate.manualCorrection && !isDateString(candidate.correctedAt)) return false;
  return Object.keys(validateProfile(candidate, today)).length === 0;
}

export function readProfile(storage: StorageLike, today: string): PregnancyProfile {
  try {
    const stored = storage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) return createDefaultProfile(today);
    const parsed: unknown = JSON.parse(stored);
    return isPregnancyProfile(parsed, today) ? parsed : createDefaultProfile(today);
  } catch {
    return createDefaultProfile(today);
  }
}

export function writeProfile(storage: StorageLike, profile: PregnancyProfile): void {
  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ ...profile, displayName: profile.displayName.trim() }));
}

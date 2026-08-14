import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, UserRound, X } from 'lucide-react';
import {
  PregnancyProfile,
  ProfileErrors,
  calculatePregnancyProgress,
  validateProfile,
} from '../../home/profile';

interface ProfileEditorProps {
  open: boolean;
  profile: PregnancyProfile;
  today: string;
  onClose: () => void;
  onSave: (profile: PregnancyProfile) => void;
}

export function ProfileEditor({ open, profile, today, onClose, onSave }: ProfileEditorProps) {
  const [draft, setDraft] = useState<PregnancyProfile>(profile);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saveError, setSaveError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(profile);
    setErrors({});
    setSaveError('');
    window.requestAnimationFrame(() => nameInputRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open, profile]);

  const progress = useMemo(() => {
    const dueDateError = validateProfile({ ...draft, displayName: draft.displayName || '预览' }, today).dueDate;
    if (dueDateError && !draft.manualCorrection) return null;
    return calculatePregnancyProgress(draft, today);
  }, [draft, today]);

  if (!open) return null;

  const toggleManualCorrection = (checked: boolean) => {
    if (!checked) {
      setDraft((current) => ({
        displayName: current.displayName,
        dueDate: current.dueDate,
        manualCorrection: false,
      }));
      return;
    }

    const automaticErrors = validateProfile({ ...draft, manualCorrection: false }, today);
    const automatic = automaticErrors.dueDate
      ? { week: 0, day: 0 }
      : calculatePregnancyProgress({ ...draft, manualCorrection: false }, today);
    setDraft((current) => ({
      ...current,
      manualCorrection: true,
      correctedWeek: automatic.week,
      correctedDay: automatic.day,
      correctedAt: today,
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextProfile = { ...draft, displayName: draft.displayName.trim() };
    const nextErrors = validateProfile(nextProfile, today);
    setErrors(nextErrors);
    setSaveError('');
    if (Object.keys(nextErrors).length > 0) return;

    try {
      onSave(nextProfile);
    } catch {
      setSaveError('暂时无法保存，请重试');
    }
  };

  const closeFromBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className="profile-editor-backdrop" onMouseDown={closeFromBackdrop}>
      <section
        className="profile-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-editor-title"
      >
        <header className="profile-editor__header">
          <div>
            <span className="eyebrow">PROFILE</span>
            <h2 id="profile-editor-title">个人资料</h2>
          </div>
          <button type="button" className="profile-editor__close" onClick={onClose} aria-label="关闭个人资料"><X size={20} /></button>
        </header>

        <form className="profile-editor__form" onSubmit={submit} noValidate>
          <label className="profile-field" htmlFor="profile-display-name">
            <span><UserRound size={16} />称呼</span>
            <input
              ref={nameInputRef}
              id="profile-display-name"
              value={draft.displayName}
              maxLength={12}
              aria-invalid={Boolean(errors.displayName)}
              aria-describedby={errors.displayName ? 'profile-display-name-error' : undefined}
              onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
            />
            {errors.displayName && <small id="profile-display-name-error" className="profile-field__error">{errors.displayName}</small>}
          </label>

          <label className="profile-field" htmlFor="profile-due-date">
            <span><CalendarDays size={16} />预产期</span>
            <input
              id="profile-due-date"
              type="date"
              value={draft.dueDate}
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={errors.dueDate ? 'profile-due-date-error' : undefined}
              onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
            />
            {errors.dueDate && <small id="profile-due-date-error" className="profile-field__error">{errors.dueDate}</small>}
          </label>

          {progress && (
            <div className="profile-week-preview" aria-live="polite">
              <span>{draft.manualCorrection ? '校正后孕周' : '按预产期计算'}</span>
              <strong>孕 {progress.week} 周 + {progress.day} 天</strong>
            </div>
          )}

          <label className="profile-correction-toggle">
            <span><strong>手动校正孕周</strong><small>产检口径不一致时使用</small></span>
            <input
              type="checkbox"
              checked={draft.manualCorrection}
              onChange={(event) => toggleManualCorrection(event.target.checked)}
            />
          </label>

          {draft.manualCorrection && (
            <div className="profile-correction-fields">
              <label className="profile-field" htmlFor="profile-corrected-week">
                <span>孕周</span>
                <input
                  id="profile-corrected-week"
                  type="number"
                  min={0}
                  max={42}
                  value={draft.correctedWeek ?? 0}
                  aria-invalid={Boolean(errors.correctedWeek)}
                  aria-describedby={errors.correctedWeek ? 'profile-corrected-week-error' : undefined}
                  onChange={(event) => setDraft({ ...draft, correctedWeek: Number(event.target.value), correctedAt: today })}
                />
                {errors.correctedWeek && <small id="profile-corrected-week-error" className="profile-field__error">{errors.correctedWeek}</small>}
              </label>
              <label className="profile-field" htmlFor="profile-corrected-day">
                <span>天数</span>
                <input
                  id="profile-corrected-day"
                  type="number"
                  min={0}
                  max={6}
                  value={draft.correctedDay ?? 0}
                  aria-invalid={Boolean(errors.correctedDay)}
                  aria-describedby={errors.correctedDay ? 'profile-corrected-day-error' : undefined}
                  onChange={(event) => setDraft({ ...draft, correctedDay: Number(event.target.value), correctedAt: today })}
                />
                {errors.correctedDay && <small id="profile-corrected-day-error" className="profile-field__error">{errors.correctedDay}</small>}
              </label>
            </div>
          )}

          {saveError && <p className="profile-editor__save-error" role="alert">{saveError}</p>}

          <div className="profile-editor__actions">
            <button type="button" className="home-button home-button--text" onClick={onClose}>取消</button>
            <button type="submit" className="home-button home-button--secondary">保存资料</button>
          </div>
        </form>
      </section>
    </div>
  );
}

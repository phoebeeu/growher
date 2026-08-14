import React from 'react';
import { AlertCircle, ArrowRight, Inbox, LoaderCircle, RotateCcw } from 'lucide-react';
import { GoalCategory, PageState, TimeTag } from '../types';

const STATE_LABELS: Array<{ value: PageState; label: string }> = [
  { value: 'empty', label: '空状态' },
  { value: 'loading', label: '加载中' },
  { value: 'success', label: '成功' },
  { value: 'failure', label: '失败' },
];

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  work: '工作',
  side_hustle: '副业 / 项目',
  exercise: '运动与体重',
  pregnancy: '孕期准备',
};

export const TIME_TAGS: TimeTag[] = ['早上', '上午', '中午', '下午', '晚上'];

export function PageIntro({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return (
    <section>
      <p className="page-kicker">{kicker}</p>
      <h2 className="page-title">{title}</h2>
      <p className="page-description">{description}</p>
    </section>
  );
}

export function StateSwitcher({ value, onChange }: { value: PageState; onChange: (state: PageState) => void }) {
  return (
    <div className="state-switcher" aria-label="页面状态演示">
      {STATE_LABELS.map((state) => (
        <button key={state.value} type="button" aria-pressed={value === state.value} onClick={() => onChange(state.value)}>
          {state.label}
        </button>
      ))}
    </div>
  );
}

export function StatePanel({ state, title, description, onRetry }: { state: Exclude<PageState, 'success'>; title: string; description: string; onRetry?: () => void }) {
  const Icon = state === 'loading' ? LoaderCircle : state === 'failure' ? AlertCircle : Inbox;
  return (
    <section className="status-panel" role={state === 'failure' ? 'alert' : 'status'}>
      <div>
        <span className="status-panel__icon">{state === 'loading' ? <span className="spinner" /> : <Icon size={24} />}</span>
        <h3 className="section-title">{title}</h3>
        <p className="page-description">{description}</p>
        {state === 'failure' && onRetry && (
          <button type="button" className="button-secondary" style={{ marginTop: 16 }} onClick={onRetry}>
            <RotateCcw size={16} />重新尝试
          </button>
        )}
      </div>
    </section>
  );
}

export function CategoryChip({ category }: { category: GoalCategory }) {
  const className = category === 'side_hustle' ? 'side' : category;
  return <span className={`chip chip--${className}`}>{CATEGORY_LABELS[category]}</span>;
}

export function TimeTagSelector({ value, onChange }: { value: TimeTag; onChange: (tag: TimeTag) => void }) {
  return (
    <div className="chip-list" aria-label="选择当天时段">
      {TIME_TAGS.map((tag) => (
        <button key={tag} type="button" className={`chip ${value === tag ? 'chip--active' : ''}`} onClick={() => onChange(tag)}>
          {tag}
        </button>
      ))}
    </div>
  );
}

export function BottomAction({ label, onClick, secondaryLabel, onSecondary, disabled = false }: { label: string; onClick: () => void; secondaryLabel?: string; onSecondary?: () => void; disabled?: boolean }) {
  return (
    <div className="app-bottom-action">
      {secondaryLabel && onSecondary && <button type="button" className="button-secondary" onClick={onSecondary}>{secondaryLabel}</button>}
      <button type="button" className="button-primary" onClick={onClick} disabled={disabled}>
        {label}<ArrowRight size={18} />
      </button>
    </div>
  );
}

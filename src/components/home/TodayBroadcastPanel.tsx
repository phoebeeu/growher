import { TaskSignalPattern, WeekRingPattern } from './PregnancyPatterns';

interface TodayBroadcastPanelProps {
  pregnancyWeek: number;
  pregnancyDay: number;
  energy: 1 | 2 | 3;
  availableMinutes: number;
  checkinCount: 1 | 2;
  taskCount: number;
  totalMinutes: number;
  explanation: string;
  loading?: boolean;
}

const ENERGY_LABELS = { 1: '低能量', 2: '一般', 3: '有余力' } as const;

export function TodayBroadcastPanel({ pregnancyWeek, pregnancyDay, energy, availableMinutes, checkinCount, taskCount, totalMinutes, explanation, loading = false }: TodayBroadcastPanelProps) {
  return (
    <section className={`broadcast-panel ${loading ? 'is-loading' : ''}`} aria-label="今日状态总览" aria-busy={loading}>
      <div className="broadcast-panel__header">
        <div><TaskSignalPattern /><strong>TODAY SIGNAL</strong><span>今日状态</span></div>
        <span>{loading ? '正在重新匹配' : `08:30 · 已确认 ${checkinCount}/2`}</span>
      </div>
      {loading ? (
        <div className="broadcast-panel__skeleton" role="status"><span /><span /><span /><p>正在匹配此刻可做的事</p></div>
      ) : (
        <div className="broadcast-panel__body">
          <div className="pregnancy-week"><span className="pregnancy-week__ring"><WeekRingPattern /></span><div><small>PREGNANCY WEEK</small><strong>{pregnancyWeek} <em>周</em></strong><span>+ {pregnancyDay} 天</span></div></div>
          <div className="signal-metric"><small>当前能量</small><strong>{energy}/3</strong><span>{ENERGY_LABELS[energy]}</span></div>
          <div className="signal-metric"><small>今日可用</small><strong>{availableMinutes}</strong><span>分钟</span></div>
          <div className="signal-result"><small>系统取舍</small><strong>保留 {taskCount} 项</strong><span>共 {totalMinutes} 分钟</span></div>
        </div>
      )}
      <div className="broadcast-panel__ticker"><span>系统建议</span><p>{loading ? '保留目标与固定日期，只调整任务大小和顺序。' : explanation}</p></div>
    </section>
  );
}

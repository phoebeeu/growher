import { useMemo, useState } from 'react';
import { ArrowDown, BatteryLow, BatteryMedium, BatteryFull, Check, Clock3, Play, RotateCcw } from 'lucide-react';
import { PageState, TodayTask } from '../../types';
import { BottomAction, CategoryChip, PageIntro, StatePanel, StateSwitcher } from '../ui';

interface Page4Props {
  todayTasks: TodayTask[];
  onUpdateTodayTasks: (tasks: TodayTask[]) => void;
  onGoToSummary: () => void;
}

const ENERGY_OPTIONS = [
  { value: 1 as const, label: '累了', icon: BatteryLow },
  { value: 2 as const, label: '还可以', icon: BatteryMedium },
  { value: 3 as const, label: '有余力', icon: BatteryFull },
];

export function Page4ActionExecution({ todayTasks, onUpdateTodayTasks, onGoToSummary }: Page4Props) {
  const [pageState, setPageState] = useState<PageState>('success');
  const [secondEnergy, setSecondEnergy] = useState<1 | 2 | 3>(1);
  const [rearranged, setRearranged] = useState(false);

  const activeTask = todayTasks.find((task) => task.isCurrentAction) ?? todayTasks[0];
  const adjustedPreview = useMemo(() => todayTasks.map((task) => secondEnergy === 1 && task.estMinutes > 15
    ? { ...task, estMinutes: 10, status: 'shrunk' as const, adjustmentNote: '第二次能量下降，缩小为 10 分钟版本' }
    : task), [secondEnergy, todayTasks]);

  const applySecondCheckin = () => {
    setPageState('loading');
    window.setTimeout(() => {
      onUpdateTodayTasks(adjustedPreview);
      setRearranged(true);
      setPageState('success');
    }, 800);
  };

  const updateTask = (id: string, patch: Partial<TodayTask>) => {
    onUpdateTodayTasks(todayTasks.map((task) => task.id === id ? { ...task, ...patch } : task));
  };

  const deferTask = (task: TodayTask) => {
    updateTask(task.id, { status: 'deferred', adjustmentNote: `已放到下一个适合的${task.timeTag}时段` });
  };

  return (
    <div className="page-stack">
      <PageIntro kicker="第 4 步 · 做一点，或重新安排" title="提醒不是命令，是一次重新协商" description="中午或任意状态变化时，都可进行第 2 次状态确认；系统会缩小或顺延任务。" />
      <StateSwitcher value={pageState} onChange={setPageState} />

      {pageState === 'empty' && <StatePanel state="empty" title="没有待执行任务" description="完成今天的状态确认后，这里会出现唯一的当前行动。" />}
      {pageState === 'loading' && <StatePanel state="loading" title="正在按新状态重排" description="保留目标与截止日期，只调整任务大小、顺序和执行时段。" />}
      {pageState === 'failure' && <StatePanel state="failure" title="重排没有完成" description="原任务顺序保持不变，可再次提交第二次状态确认。" onRetry={applySecondCheckin} />}

      {pageState === 'success' && (
        <>
          <section className="card card--accent stack-12">
            <div className="row-between"><div><h3 className="section-title">第 2 次状态确认</h3><p className="muted-copy">建议中午问一次，也可以在任意时刻修改。</p></div><Clock3 size={20} /></div>
            <div className="energy-grid">
              {ENERGY_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button type="button" key={value} className="energy-option" aria-pressed={secondEnergy === value} onClick={() => setSecondEnergy(value)}><Icon size={22} /><strong>{label}</strong><span>{value === 1 ? '缩小任务' : value === 2 ? '保持节奏' : '继续当前计划'}</span></button>
              ))}
            </div>
            <button type="button" className="button-secondary" onClick={applySecondCheckin}><RotateCcw size={17} />按当前状态重新安排</button>
          </section>

          <section className="comparison">
            <article className="card card--flat">
              <span className="caption">调整前</span>
              <div className="row-between" style={{ marginTop: 6 }}><strong>{activeTask?.title}</strong><span className="chip">{activeTask?.estMinutes} 分钟</span></div>
            </article>
            <ArrowDown className="comparison__arrow" size={20} />
            <article className={`card ${rearranged ? 'card--success' : 'card--flat'}`}>
              <span className="caption">调整后</span>
              <div className="row-between" style={{ marginTop: 6 }}><strong>{adjustedPreview[0]?.title}</strong><span className="chip chip--active">{adjustedPreview[0]?.estMinutes} 分钟</span></div>
              <p className="muted-copy" style={{ marginTop: 6 }}>{secondEnergy === 1 ? '先完成 10 分钟版本，剩余部分不视为失败。' : '任务长度与当前能量匹配，保持原计划。'}</p>
            </article>
          </section>

          <section className="stack-12">
            <div><h3 className="section-title">当前行动</h3><p className="muted-copy">一次只看一件事。</p></div>
            {todayTasks.map((task) => (
              <article key={task.id} className={`task-card ${task.isCurrentAction ? 'task-card--current' : ''}`}>
                <div className="row-between"><CategoryChip category={task.category} /><span className="chip">{task.timeTag} · {task.estMinutes} 分钟</span></div>
                <h3 className="section-title" style={{ marginTop: 12 }}>{task.title}</h3>
                {task.adjustmentNote && <p className="notice" style={{ marginTop: 10 }}>{task.adjustmentNote}</p>}
                <div className="chip-list" style={{ marginTop: 12 }}>
                  <button type="button" className="button-secondary" onClick={() => updateTask(task.id, { status: 'in_progress', isCurrentAction: true })}><Play size={16} />开始</button>
                  <button type="button" className="button-secondary" onClick={() => updateTask(task.id, { status: 'completed', isCurrentAction: false })}><Check size={16} />完成</button>
                  <button type="button" className="button-quiet" onClick={() => deferTask(task)}><Clock3 size={16} />晚点可以</button>
                </div>
              </article>
            ))}
          </section>
          <BottomAction label="结束今天，查看总结" onClick={onGoToSummary} />
        </>
      )}
    </div>
  );
}

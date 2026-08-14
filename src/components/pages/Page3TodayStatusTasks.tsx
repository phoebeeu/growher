import { useState } from 'react';
import { BatteryLow, BatteryMedium, BatteryFull, Clock3, Sparkles } from 'lucide-react';
import { EnergyCheckin, PageState, TodayTask } from '../../types';
import { BottomAction, CategoryChip, PageIntro, StatePanel, StateSwitcher } from '../ui';

interface Page3Props {
  initialEnergy: EnergyCheckin;
  todayTasks: TodayTask[];
  onUpdateTodayTasks: (tasks: TodayTask[]) => void;
  onUpdateEnergy: (energy: EnergyCheckin) => void;
  onConfirmTodaySchedule: () => void;
}

const ENERGY_OPTIONS = [
  { value: 1 as const, label: '低能量', hint: '只做 5–10 分钟', icon: BatteryLow },
  { value: 2 as const, label: '一般', hint: '做 15–25 分钟', icon: BatteryMedium },
  { value: 3 as const, label: '有余力', hint: '可做 30 分钟', icon: BatteryFull },
];

export function Page3TodayStatusTasks({ initialEnergy, todayTasks, onUpdateTodayTasks, onUpdateEnergy, onConfirmTodaySchedule }: Page3Props) {
  const [pageState, setPageState] = useState<PageState>('success');
  const [energy, setEnergy] = useState<1 | 2 | 3>(initialEnergy.energyLevel);
  const [minutes, setMinutes] = useState(initialEnergy.availableMinutes);
  const [reason, setReason] = useState(initialEnergy.reason);

  const setCurrentTask = (id: string) => {
    onUpdateTodayTasks(todayTasks.map((task) => ({ ...task, isCurrentAction: task.id === id })));
  };

  const confirmStatus = () => {
    onUpdateEnergy({ energyLevel: energy, availableMinutes: minutes, reason, checkinCount: 1, timestamp: '08:30 早上' });
    onConfirmTodaySchedule();
  };

  const retry = () => {
    setPageState('loading');
    window.setTimeout(() => setPageState('success'), 800);
  };

  const visibleTasks = todayTasks.slice(0, energy === 1 ? 1 : energy === 2 ? 2 : 3);

  return (
    <div className="page-stack">
      <PageIntro kicker="第 3 步 · 第 1 次状态确认" title="今天先做多少，由现在的你决定" description="每天首次打开时用一个轻动作确认能量；系统据此减少任务，而不是催你完成全部计划。" />
      <StateSwitcher value={pageState} onChange={setPageState} />

      {pageState === 'empty' && <StatePanel state="empty" title="今天还没有安排" description="先选择当下能量和可用时间，系统才会从本周重点中挑出今日任务。" />}
      {pageState === 'loading' && <StatePanel state="loading" title="正在匹配此刻可做的事" description="AI 正在结合能量、任务长度、倾向时段与截止日期。" />}
      {pageState === 'failure' && <StatePanel state="failure" title="今日任务没有生成成功" description="状态记录已经保存，可以重新匹配任务。" onRetry={retry} />}

      {pageState === 'success' && (
        <>
          <section className="card stack-16">
            <div><h3 className="section-title">你现在有多少能量？</h3><p className="muted-copy">不是心理诊断，只用于调整今天的任务强度。</p></div>
            <div className="energy-grid">
              {ENERGY_OPTIONS.map(({ value, label, hint, icon: Icon }) => (
                <button type="button" className="energy-option" key={value} aria-pressed={energy === value} onClick={() => setEnergy(value)}>
                  <Icon size={22} /><strong>{label}</strong><span>{hint}</span>
                </button>
              ))}
            </div>
            <label><span className="label">今天还能拿出多少分钟？</span><span className="input-suffix"><input className="field" type="number" min="5" step="5" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /><span>分钟</span></span></label>
            <label><span className="label">可选：影响状态的原因</span><textarea className="text-area" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：昨晚没睡好，午后容易腰酸" /></label>
          </section>

          <section className="card card--accent">
            <div className="card-title-row"><span className="card-icon"><Sparkles size={19} /></span><div><h3 className="section-title">AI 今日取舍</h3><p className="muted-copy">当前能量下保留 {visibleTasks.length} 项，共 {visibleTasks.reduce((sum, task) => sum + task.estMinutes, 0)} 分钟。</p></div></div>
          </section>

          <section className="stack-12">
            {visibleTasks.map((task, index) => (
              <article key={task.id} className={`task-card ${task.isCurrentAction ? 'task-card--current' : ''}`}>
                <div className="row-between"><CategoryChip category={task.category} /><span className="chip">{task.timeTag} · {task.estMinutes} 分钟</span></div>
                <h3 className="section-title" style={{ marginTop: 12 }}>{task.title}</h3>
                <p className="muted-copy">完成条件：{task.completionCondition}</p>
                <div className="first-action" style={{ marginTop: 12 }}><span className="caption">为什么现在推荐</span><p className="body-copy">{index === 0 ? `它符合你当前 ${minutes} 分钟的容量，且是本周目标的最小下一步。` : `它适合放在${task.timeTag}，如果状态下降可以继续缩小。`}</p></div>
                {!task.isCurrentAction && <button type="button" className="button-quiet" style={{ marginTop: 8 }} onClick={() => setCurrentTask(task.id)}><Clock3 size={16} />改为先做这项</button>}
              </article>
            ))}
          </section>
          <BottomAction label="确认今日顺序" onClick={confirmStatus} />
        </>
      )}
    </div>
  );
}

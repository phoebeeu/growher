import { Check, Clock3, Play, RotateCcw, X } from 'lucide-react';
import { TodayTask } from '../../types';
import { CategoryChip } from '../ui';

interface Props {
  task?: TodayTask;
  started: boolean;
  rejectOpen: boolean;
  onStart: () => void;
  onComplete: () => void;
  onDefer: () => void;
  onReject: () => void;
  onShrink: () => void;
  onTomorrow: () => void;
  onRemove: () => void;
}

export function CurrentActionCard(p: Props) {
  if (!p.task) return <section className="home-card home-empty"><strong>今天的推荐已经完成</strong><p>可以查看今日总结，或先休息。</p></section>;
  const task = p.task;
  return (
    <section className="home-card current-action-card">
      <div className="home-section-heading"><div><span className="eyebrow">CURRENT ACTION</span><h2>现在最适合做</h2></div><span className="current-flag">当前行动</span></div>
      <div className="current-action-card__meta"><CategoryChip category={task.category} /><span><Clock3 size={15} />{task.timeTag} · {task.estMinutes} 分钟</span></div>
      <h3>{task.title}</h3>
      <div className="completion-rule"><span>完成条件</span><p>{task.completionCondition}</p></div>
      <div className="recommendation-reason"><span>为什么现在推荐</span><p>{task.adjustmentNote || `它符合当前时间容量，是“${task.goalTitle}”最小的下一步。`}</p></div>
      {p.started && <div className="task-progress" role="status"><span /><p>已开始。只完成这一步即可，不追加任务。</p></div>}
      {!p.rejectOpen ? <div className="current-action-card__actions">
        <button type="button" className="home-button home-button--primary" onClick={p.started ? p.onComplete : p.onStart}>{p.started ? <Check size={18} /> : <Play size={18} />}{p.started ? '完成这一步' : '现在开始'}</button>
        <button type="button" className="home-button home-button--secondary" onClick={p.onDefer}><Clock3 size={18} />晚点可以</button>
        <button type="button" className="home-button home-button--text" onClick={p.onReject}><X size={18} />今天不行</button>
      </div> : <div className="reject-options" role="group" aria-label="调整方式">
        <p>选择一个明确安排：</p>
        <button type="button" onClick={p.onShrink}><RotateCcw size={17} />缩小为 10 分钟</button>
        <button type="button" onClick={p.onTomorrow}><Clock3 size={17} />移到明天上午</button>
        <button type="button" onClick={p.onRemove}><X size={17} />从本周移除</button>
      </div>}
    </section>
  );
}

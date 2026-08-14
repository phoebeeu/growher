import { useState } from 'react';
import { CalendarCheck, CheckCircle2, Clock3, Sparkles, TrendingUp } from 'lucide-react';
import { DailySummary, PageState, TimeTag } from '../../types';
import { BottomAction, CategoryChip, PageIntro, StatePanel, StateSwitcher, TimeTagSelector } from '../ui';

interface Page5Props {
  summary: DailySummary;
  onUpdateSummary: (summary: DailySummary) => void;
  onRestartCycle: () => void;
}

export function Page5SummaryTomorrow({ summary, onUpdateSummary, onRestartCycle }: Page5Props) {
  const [pageState, setPageState] = useState<PageState>('success');
  const [tomorrowTag, setTomorrowTag] = useState<TimeTag>(summary.tomorrowFirstStep.suggestedTimeTag);
  const [confirmed, setConfirmed] = useState(false);

  const retry = () => {
    setPageState('loading');
    window.setTimeout(() => setPageState('success'), 850);
  };

  const confirmTomorrow = () => {
    onUpdateSummary({ ...summary, tomorrowFirstStep: { ...summary.tomorrowFirstStep, suggestedTimeTag: tomorrowTag } });
    setConfirmed(true);
  };

  const completedMinutes = summary.completedTasks.reduce((sum, task) => sum + task.estMinutes, 0);
  const plannedCount = summary.completedTasks.length + summary.uncompletedTasks.length;
  const completionRate = plannedCount ? Math.round((summary.completedTasks.length / plannedCount) * 100) : 0;

  return (
    <div className="page-stack">
      <PageIntro kicker="第 5 步 · 当天闭环" title="把今天变成明天更容易的一步" description="总结完成证据与状态规律，并提前放好明天第一个小行动。" />
      <StateSwitcher value={pageState} onChange={setPageState} />

      {pageState === 'empty' && <StatePanel state="empty" title="今天还没有可总结的记录" description="执行、完成或顺延至少一项任务后，这里会生成状态分析。" />}
      {pageState === 'loading' && <StatePanel state="loading" title="正在整理今天的节奏" description="AI 正在比较两次能量、任务调整和实际完成情况。" />}
      {pageState === 'failure' && <StatePanel state="failure" title="总结暂时没有生成" description="今天的任务记录没有丢失，可以重新分析。" onRetry={retry} />}

      {pageState === 'success' && (
        <>
          <section className="card card--success stack-12">
            <div className="row-between"><div><h3 className="section-title">今日完成证据</h3><p className="muted-copy">{summary.date}</p></div><CheckCircle2 size={22} /></div>
            <div className="metric-row">
              <div className="metric"><strong>{summary.completedTasks.length}</strong><span>完成任务</span></div>
              <div className="metric"><strong>{completedMinutes}</strong><span>投入分钟</span></div>
              <div className="metric"><strong>{completionRate}%</strong><span>完成比例</span></div>
            </div>
            <div className="progress-track"><div className="progress-bar" style={{ width: `${completionRate}%` }} /></div>
          </section>

          <section className="stack-8">
            {summary.completedTasks.map((task) => (
              <article className="task-card" key={task.id}>
                <div className="row-between"><CategoryChip category={task.category} /><span className="chip">已完成 · {task.estMinutes} 分钟</span></div>
                <p className="body-copy" style={{ marginTop: 10, fontWeight: 700 }}>{task.title}</p>
                {task.adjustmentNote && <p className="muted-copy">{task.adjustmentNote}</p>}
              </article>
            ))}
            {summary.uncompletedTasks.map((task) => (
              <article className="task-card" key={task.id}>
                <div className="row-between"><CategoryChip category={task.category} /><span className="chip">已顺延</span></div>
                <p className="body-copy" style={{ marginTop: 10, fontWeight: 700 }}>{task.title}</p>
                <p className="muted-copy">{task.adjustmentNote || '放到下一个可执行时段'}</p>
              </article>
            ))}
          </section>

          <section className="card card--accent stack-12">
            <div className="card-title-row"><span className="card-icon"><Sparkles size={19} /></span><div><h3 className="section-title">状态分析</h3><p className="muted-copy">来自今天两次能量确认和任务结果。</p></div></div>
            <p className="body-copy">{summary.patternInsight}</p>
            <div className="metric-row">
              <div className="metric"><strong>{summary.firstEnergy}/3</strong><span>首次能量</span></div>
              <div className="metric"><strong>{summary.secondEnergy ?? '—'}/3</strong><span>二次能量</span></div>
              <div className="metric"><strong>{summary.actualHours}</strong><span>实际小时</span></div>
            </div>
          </section>

          <section className="card stack-12">
            <div className="row-between"><div><h3 className="section-title">近 7 日规律</h3><p className="muted-copy">数据不足时只显示趋势，不做健康诊断。</p></div><TrendingUp size={20} /></div>
            <p className="notice">上午完成率较高；傍晚更适合 10–15 分钟的轻任务。再记录 4 天后更新建议。</p>
          </section>

          <section className={`card ${confirmed ? 'card--success' : 'card--accent'} stack-12`}>
            <div className="row-between"><div><h3 className="section-title">明天的第一个小行动</h3><p className="muted-copy">只预先决定第一步，不排满全天。</p></div><CalendarCheck size={20} /></div>
            <div className="first-action"><span className="caption">来自：{summary.tomorrowFirstStep.goalTitle}</span><p className="body-copy"><strong>{summary.tomorrowFirstStep.title}</strong></p></div>
            <div><span className="label"><Clock3 size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />更适合放在</span><TimeTagSelector value={tomorrowTag} onChange={setTomorrowTag} /></div>
            {confirmed && <p className="body-copy"><CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 5 }} />已放入明天的 {tomorrowTag}。</p>}
          </section>
          <BottomAction label={confirmed ? '明日第一步已确认' : '确认明日第一步'} onClick={confirmTomorrow} secondaryLabel="重新体验" onSecondary={onRestartCycle} />
        </>
      )}
    </div>
  );
}

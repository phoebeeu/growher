import { useState } from 'react';
import { BriefcaseBusiness, CalendarClock, Clock3, Sparkles } from 'lucide-react';
import { CheckupNode, PageState, TimeTag, WeeklyFocusTask, WorkSchedule } from '../../types';
import { BottomAction, CategoryChip, PageIntro, StatePanel, StateSwitcher, TimeTagSelector } from '../ui';

interface Page2Props {
  workSchedule: WorkSchedule;
  checkups: CheckupNode[];
  weeklyFocusTasks: WeeklyFocusTask[];
  onUpdateWeeklyFocusTasks: (tasks: WeeklyFocusTask[]) => void;
  onConfirmWeeklyFocus: () => void;
}

export function Page2WeeklyFocus({ workSchedule, checkups, weeklyFocusTasks, onUpdateWeeklyFocusTasks, onConfirmWeeklyFocus }: Page2Props) {
  const [pageState, setPageState] = useState<PageState>('success');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [personalPlan, setPersonalPlan] = useState('周六下午家庭聚餐；周日上午需要休息');

  const updateTimeTag = (id: string, timeTag: TimeTag) => {
    onUpdateWeeklyFocusTasks(weeklyFocusTasks.map((task) => task.id === id ? { ...task, timeTag } : task));
  };

  const runAnalysis = () => {
    setPageState('loading');
    window.setTimeout(() => setPageState('success'), 900);
  };

  const workDays = workSchedule.workDays.join('、');
  const totalTaskHours = weeklyFocusTasks.reduce((sum, task) => sum + task.estHours, 0);

  return (
    <div className="page-stack">
      <PageIntro kicker="第 2 步 · 每周一次" title="先确认这周真实能用的时间" description="系统先复述你的安排，再决定本周重点，不把任务塞进已经被占用的时间。" />
      <StateSwitcher value={pageState} onChange={setPageState} />

      {pageState === 'empty' && <StatePanel state="empty" title="还不知道你这周有多忙" description="确认工作、产检和临时安排后，AI 才会给出本周重点。" />}
      {pageState === 'loading' && <StatePanel state="loading" title="正在计算本周容量" description="AI 正在避开工作与固定产检，并匹配目标截止日期。" />}
      {pageState === 'failure' && <StatePanel state="failure" title="分析暂时中断" description="时间输入已保留，请重新分析本周重点。" onRetry={runAnalysis} />}

      {pageState === 'success' && (
        <>
          <section className="card stack-12">
            <div className="card-header"><div><h3 className="section-title">本周时间复述</h3><p className="muted-copy">先确认，再让 AI 做安排。</p></div><CalendarClock size={20} /></div>
            <div className="stack-8">
              <div className="notice"><BriefcaseBusiness size={18} /><span><strong>工作：</strong>{workDays}，{workSchedule.startTime}–{workSchedule.endTime}</span></div>
              {checkups.map((checkup) => <div className="notice" key={checkup.id}><CalendarClock size={18} /><span><strong>固定产检：</strong>{checkup.date} {checkup.time} · {checkup.title}</span></div>)}
            </div>
            <label><span className="label">其他已占用安排</span><textarea className="text-area" value={personalPlan} onChange={(event) => setPersonalPlan(event.target.value)} /></label>
            <label><span className="label">除工作外，本周最多可投入</span><span className="input-suffix"><input className="field" type="number" min="1" max="40" value={weeklyHours} onChange={(event) => setWeeklyHours(Number(event.target.value))} /><span>小时</span></span></label>
            <button type="button" className="button-secondary" onClick={runAnalysis}><Sparkles size={17} />按这些时间重新分析</button>
          </section>

          <section className={`card ${totalTaskHours > weeklyHours ? 'card--warning' : 'card--success'}`}>
            <div className="row-between"><div><h3 className="section-title">容量结论</h3><p className="muted-copy">计划 {totalTaskHours} 小时 / 可用 {weeklyHours} 小时</p></div><strong>{totalTaskHours <= weeklyHours ? '可执行' : '需减量'}</strong></div>
            <div className="progress-track" style={{ marginTop: 12 }}><div className="progress-bar" style={{ width: `${Math.min(100, (totalTaskHours / weeklyHours) * 100)}%` }} /></div>
          </section>

          <section className="stack-12">
            <div><h3 className="section-title">AI 建议的本周重点</h3><p className="muted-copy">每项都标出来源、完成条件与当天时段。</p></div>
            {weeklyFocusTasks.map((task, index) => (
              <article className="task-card" key={task.id}>
                <div className="row-between"><CategoryChip category={task.category} /><span className="caption">重点 {index + 1}</span></div>
                <h4 className="section-title" style={{ marginTop: 12 }}>{task.goalTitle}</h4>
                <dl className="task-meta" style={{ marginTop: 12 }}>
                  <div className="meta-item"><dt>来源</dt><dd><CategoryChip category={task.category} /></dd></div>
                  <div className="meta-item"><dt>预计用时</dt><dd>{task.estHours} 小时</dd></div>
                  <div className="meta-item" style={{ gridColumn: '1 / -1' }}><dt>本周完成条件</dt><dd>{task.completionCondition}</dd></div>
                  <div className="meta-item" style={{ gridColumn: '1 / -1' }}><dt>建议日期</dt><dd>{task.suggestedDate}</dd></div>
                </dl>
                <div className="first-action" style={{ marginTop: 12 }}><span className="caption">第一步行动</span><p className="body-copy"><strong>{task.firstAction}</strong></p></div>
                <div style={{ marginTop: 12 }}><span className="label"><Clock3 size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />倾向执行时段</span><TimeTagSelector value={task.timeTag} onChange={(tag) => updateTimeTag(task.id, tag)} /></div>
              </article>
            ))}
          </section>
          <BottomAction label="确认本周重点" onClick={onConfirmWeeklyFocus} disabled={totalTaskHours > weeklyHours} />
        </>
      )}
    </div>
  );
}

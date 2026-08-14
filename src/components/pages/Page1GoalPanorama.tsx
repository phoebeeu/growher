import { useState } from 'react';
import { Baby, BriefcaseBusiness, CalendarDays, ChevronDown, ChevronUp, Dumbbell, Plus, Sparkles, Trash2 } from 'lucide-react';
import { CheckupNode, GoalCategory, Milestone, NonWorkGoal, PageState, WorkSchedule } from '../../types';
import { BottomAction, CategoryChip, PageIntro, StatePanel, StateSwitcher } from '../ui';

interface Page1Props {
  workSchedule: WorkSchedule;
  onUpdateWorkSchedule: (schedule: WorkSchedule) => void;
  goals: NonWorkGoal[];
  onUpdateGoals: (goals: NonWorkGoal[]) => void;
  checkups: CheckupNode[];
  onUpdateCheckups: (checkups: CheckupNode[]) => void;
  milestones: Milestone[];
  onUpdateMilestones: (milestones: Milestone[]) => void;
  onConfirmPanorama: () => void;
}

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const GOAL_SECTIONS: Array<{ category: GoalCategory; title: string; hint: string; icon: typeof BriefcaseBusiness }> = [
  { category: 'work', title: '工作', hint: '只预留时间，不让 AI 拆解', icon: BriefcaseBusiness },
  { category: 'side_hustle', title: '副业 / 项目 / 兴趣', hint: '明确结果、每周投入和截止日期', icon: Sparkles },
  { category: 'exercise', title: '运动与体重', hint: '按孕期状态拆成可执行的小行动', icon: Dumbbell },
  { category: 'pregnancy', title: '孕期准备与产检', hint: '准备任务可拆解；产检日期固定', icon: Baby },
];

export function Page1GoalPanorama({ workSchedule, onUpdateWorkSchedule, goals, onUpdateGoals, checkups, onUpdateCheckups, milestones, onUpdateMilestones, onConfirmPanorama }: Page1Props) {
  const [pageState, setPageState] = useState<PageState>('success');
  const [openSection, setOpenSection] = useState<GoalCategory>('work');
  const [draftCheckup, setDraftCheckup] = useState({ title: '', date: '', time: '09:00', notes: '' });

  const updateGoal = (category: NonWorkGoal['category'], patch: Partial<NonWorkGoal>) => {
    onUpdateGoals(goals.map((goal) => goal.category === category ? { ...goal, ...patch } : goal));
  };

  const toggleWorkDay = (day: string) => {
    const workDays = workSchedule.workDays.includes(day)
      ? workSchedule.workDays.filter((item) => item !== day)
      : [...workSchedule.workDays, day];
    onUpdateWorkSchedule({ ...workSchedule, workDays });
  };

  const addCheckup = () => {
    if (!draftCheckup.title.trim() || !draftCheckup.date) return;
    onUpdateCheckups([...checkups, { ...draftCheckup, id: `checkup-${Date.now()}` }]);
    setDraftCheckup({ title: '', date: '', time: '09:00', notes: '' });
  };

  const runAnalysis = () => {
    setPageState('loading');
    window.setTimeout(() => {
      onUpdateMilestones(milestones.map((milestone) => ({ ...milestone })));
      setPageState('success');
    }, 900);
  };

  const timeline = [
    ...milestones.map((item) => ({ id: item.id, title: item.title, date: `${item.startDate} → ${item.endDate}`, category: item.category as GoalCategory, fixed: false, meta: `${item.estHours} 小时 · ${item.status === 'paused' ? '暂缓' : '进行中'}` })),
    ...checkups.map((item) => ({ id: item.id, title: item.title, date: `${item.date} ${item.time}`, category: 'pregnancy' as GoalCategory, fixed: true, meta: '固定日期 · AI 不可移动' })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const nonWorkComplete = goals.every((goal) => goal.title.trim() && goal.weeklyHours > 0 && goal.targetDate);

  return (
    <div className="page-stack">
      <PageIntro kicker="第 1 步 · 一次设定，持续调整" title="先把生活放进同一张图里" description="工作只占用时间；其余三类目标由 AI 拆成可完成的阶段。" />
      <StateSwitcher value={pageState} onChange={setPageState} />

      {pageState === 'empty' && <StatePanel state="empty" title="还没有目标" description="先添加工作时间，再填写至少一个非工作目标。产检日期可随时补充。" />}
      {pageState === 'loading' && <StatePanel state="loading" title="正在生成全景图" description="AI 正在核对截止日期、每周容量和固定产检节点。" />}
      {pageState === 'failure' && <StatePanel state="failure" title="这次没有生成成功" description="你的输入已保留。检查目标或稍后再次生成。" onRetry={runAnalysis} />}

      {pageState === 'success' && (
        <>
          <section className="stack-8" aria-label="四类目标">
            {GOAL_SECTIONS.map(({ category, title, hint, icon: Icon }) => {
              const isOpen = openSection === category;
              const goal = goals.find((item) => item.category === category);
              return (
                <article className="accordion" key={category}>
                  <button type="button" className="accordion__trigger" onClick={() => setOpenSection(category)} aria-expanded={isOpen}>
                    <span className="card-title-row">
                      <span className="card-icon"><Icon size={19} /></span>
                      <span className="stack-4"><strong>{title}</strong><span className="caption">{hint}</span></span>
                    </span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div className="accordion__body stack-12">
                      {category === 'work' ? (
                        <>
                          <div><span className="label">工作日</span><div className="chip-list">{DAYS.map((day) => <button type="button" key={day} className={`chip ${workSchedule.workDays.includes(day) ? 'chip--active' : ''}`} onClick={() => toggleWorkDay(day)}>{day}</button>)}</div></div>
                          <div className="field-grid">
                            <label><span className="label">开始时间</span><input className="field" type="time" value={workSchedule.startTime} onChange={(event) => onUpdateWorkSchedule({ ...workSchedule, startTime: event.target.value })} /></label>
                            <label><span className="label">结束时间</span><input className="field" type="time" value={workSchedule.endTime} onChange={(event) => onUpdateWorkSchedule({ ...workSchedule, endTime: event.target.value })} /></label>
                          </div>
                          <p className="notice">工作只作为不可占用时段，不生成工作任务。</p>
                        </>
                      ) : goal ? (
                        <>
                          <label><span className="label">你想达到什么结果？</span><textarea className="text-area" value={goal.title} onChange={(event) => updateGoal(goal.category, { title: event.target.value })} /></label>
                          <div className="field-grid">
                            <label><span className="label">每周可投入</span><span className="input-suffix"><input className="field" type="number" min="0.5" step="0.5" value={goal.weeklyHours} onChange={(event) => updateGoal(goal.category, { weeklyHours: Number(event.target.value) })} /><span>小时</span></span></label>
                            <label><span className="label">截止日期</span><input className="field" type="date" value={goal.targetDate} onChange={(event) => updateGoal(goal.category, { targetDate: event.target.value })} /></label>
                          </div>
                          {category === 'pregnancy' && (
                            <div className="stack-12">
                              <div className="divider" />
                              <div className="row-between"><h3 className="section-title">固定产检日期</h3><span className="chip chip--pregnancy">AI 不可移动</span></div>
                              {checkups.map((item) => (
                                <div className="card card--flat" key={item.id}>
                                  <div className="row-between"><div><strong>{item.title}</strong><p className="muted-copy">{item.date} · {item.time}</p></div><button type="button" className="icon-button" aria-label="删除产检" onClick={() => onUpdateCheckups(checkups.filter((checkup) => checkup.id !== item.id))}><Trash2 size={17} /></button></div>
                                </div>
                              ))}
                              <label><span className="label">产检名称</span><input className="field" placeholder="例如：孕 24 周糖耐检查" value={draftCheckup.title} onChange={(event) => setDraftCheckup({ ...draftCheckup, title: event.target.value })} /></label>
                              <div className="field-grid"><label><span className="label">日期</span><input className="field" type="date" value={draftCheckup.date} onChange={(event) => setDraftCheckup({ ...draftCheckup, date: event.target.value })} /></label><label><span className="label">时间</span><input className="field" type="time" value={draftCheckup.time} onChange={(event) => setDraftCheckup({ ...draftCheckup, time: event.target.value })} /></label></div>
                              <button type="button" className="button-secondary" onClick={addCheckup}><Plus size={17} />添加固定日期</button>
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          <section className="card card--accent stack-12">
            <div className="card-header"><div><h3 className="section-title">Whole Picture · 全景图</h3><p className="muted-copy">任务节点可以调整，产检节点保持固定。</p></div><CalendarDays size={20} /></div>
            <div className="whole-picture-timeline">
              {timeline.map((item) => (
                <article key={item.id} className={`timeline-item ${item.fixed ? 'timeline-item--fixed' : ''}`}>
                  <div className="row-between"><CategoryChip category={item.category} /><span className="caption">{item.date}</span></div>
                  <p className="body-copy" style={{ marginTop: 8, fontWeight: 700 }}>{item.title}</p>
                  <p className="muted-copy">{item.meta}</p>
                </article>
              ))}
            </div>
            <button type="button" className="button-secondary" onClick={runAnalysis}><Sparkles size={17} />重新生成拆解</button>
          </section>
          <BottomAction label="确认全景图，安排本周" onClick={onConfirmPanorama} disabled={!nonWorkComplete} />
        </>
      )}
    </div>
  );
}

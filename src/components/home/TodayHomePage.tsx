import { useCallback, useMemo, useState } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { CheckupNode, EnergyCheckin, TodayTask } from '../../types';
import { buildRecommendation, deferCurrentTask } from '../../home/recommendation';
import { PregnancyProfile, calculatePregnancyProgress, readProfile, writeProfile } from '../../home/profile';
import { CurrentActionCard } from './CurrentActionCard';
import { EnergyAdjuster } from './EnergyAdjuster';
import { HomeHeader } from './HomeHeader';
import { HomeQuickLinks } from './HomeQuickLinks';
import { NextCheckupCard } from './NextCheckupCard';
import { ProfileEditor } from './ProfileEditor';
import { TodayBroadcastPanel } from './TodayBroadcastPanel';
import { UpcomingTasks } from './UpcomingTasks';

interface Props {
  initialTasks: TodayTask[];
  initialEnergy: EnergyCheckin;
  checkups: CheckupNode[];
  onOpenFlow: (step: number) => void;
}

export function TodayHomePage({ initialTasks, initialEnergy, checkups, onOpenFlow }: Props) {
  const now = useMemo(() => new Date(), []);
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dateLabel = `${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(now)}`;
  const eyebrow = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(now).replace(',', ' ·').toUpperCase();
  const initial = useMemo(() => buildRecommendation(initialTasks, initialEnergy.energyLevel, initialEnergy.availableMinutes), [initialEnergy, initialTasks]);
  const [profile, setProfile] = useState(() => readProfile(window.localStorage, today));
  const [profileOpen, setProfileOpen] = useState(false);
  const [tasks, setTasks] = useState<TodayTask[]>(initial.visibleTasks);
  const [energy, setEnergy] = useState<1 | 2 | 3>(initialEnergy.energyLevel);
  const [minutes, setMinutes] = useState(initialEnergy.availableMinutes);
  const [draftEnergy, setDraftEnergy] = useState<1 | 2 | 3>(initialEnergy.energyLevel);
  const [draftMinutes, setDraftMinutes] = useState(30);
  const [checkinCount, setCheckinCount] = useState<1 | 2>(1);
  const [explanation, setExplanation] = useState(initial.explanation);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const pregnancy = useMemo(() => calculatePregnancyProgress(profile, today), [profile, today]);

  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const saveProfile = useCallback((nextProfile: PregnancyProfile) => {
    writeProfile(window.localStorage, nextProfile);
    setProfile(nextProfile);
    setProfileOpen(false);
    setNotice('个人资料已更新');
  }, []);

  const preview = useMemo(() => buildRecommendation(initialTasks, draftEnergy, draftMinutes), [draftEnergy, draftMinutes, initialTasks]);
  const activeTask = tasks.find((task) => task.isCurrentAction && task.status !== 'completed' && task.status !== 'deferred');
  const upcoming = tasks.filter((task) => task.id !== activeTask?.id && task.status !== 'completed' && task.status !== 'deferred');
  const totalMinutes = tasks.filter((task) => task.status !== 'completed' && task.status !== 'deferred').reduce((sum, task) => sum + task.estMinutes, 0);

  const promoteNext = (nextTasks: TodayTask[]) => {
    let promoted = false;
    return nextTasks.map((task) => {
      if (!promoted && task.status !== 'completed' && task.status !== 'deferred') {
        promoted = true;
        return { ...task, isCurrentAction: true };
      }
      return { ...task, isCurrentAction: false };
    });
  };

  const adjustByEnergy = () => {
    if (checkinCount === 2) return;
    setLoading(true);
    setNotice('');
    window.setTimeout(() => {
      const result = buildRecommendation(initialTasks, draftEnergy, draftMinutes);
      setTasks(result.visibleTasks);
      setEnergy(draftEnergy);
      setMinutes(draftMinutes);
      setExplanation(result.explanation);
      setCheckinCount(2);
      setStarted(false);
      setRejectOpen(false);
      setNotice('已根据此刻状态重新安排。固定产检日期没有变化。');
      setLoading(false);
    }, 500);
  };

  const completeCurrent = () => {
    if (!activeTask) return;
    const updated = tasks.map((task) => task.id === activeTask.id ? { ...task, status: 'completed' as const, isCurrentAction: false } : task);
    setTasks(promoteNext(updated));
    setStarted(false);
    setNotice('这一步已完成。系统只把下一项提升为当前行动。');
  };

  const deferCurrent = () => {
    if (!activeTask) return;
    setTasks(deferCurrentTask(tasks, activeTask.id));
    setStarted(false);
    setNotice('已把这项安排到晚上 19:30，并为你切换到下一项。');
  };

  const updateRejectedTask = (mode: 'shrink' | 'tomorrow' | 'remove') => {
    if (!activeTask) return;
    if (mode === 'shrink') {
      setTasks(tasks.map((task) => task.id === activeTask.id ? { ...task, estMinutes: 10, status: 'shrunk', adjustmentNote: '已缩小为 10 分钟版本' } : task));
      setNotice('已缩小为 10 分钟版本，剩余部分不视为失败。');
    } else {
      const note = mode === 'tomorrow' ? '已移到明天上午' : '已从本周计划移除';
      const updated = tasks.map((task) => task.id === activeTask.id ? { ...task, status: 'deferred' as const, isCurrentAction: false, adjustmentNote: note } : task);
      setTasks(promoteNext(updated));
      setNotice(note + '。');
    }
    setRejectOpen(false);
    setStarted(false);
  };

  return <div className="today-home-stage">
    <div className="today-home">
      <HomeHeader pregnancyWeek={pregnancy.week} dateLabel={dateLabel} onOpenProfile={() => setProfileOpen(true)} onOpenFlow={onOpenFlow} />
      <main className="home-main">
        <div className="home-welcome"><div><span className="eyebrow">{eyebrow}</span><h1>早上好，{profile.displayName}</h1><p>先看此刻能做什么，不需要重新列一遍计划。</p></div><span className="home-welcome__week">孕 {pregnancy.week} 周 + {pregnancy.day} 天</span></div>
        {notice && <div className="home-notice" role="status"><CheckCircle2 size={18} /><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="关闭提示">×</button></div>}
        <div className="home-layout">
          <div className="home-primary">
            <TodayBroadcastPanel pregnancyWeek={pregnancy.week} pregnancyDay={pregnancy.day} energy={energy} availableMinutes={minutes} checkinCount={checkinCount} taskCount={tasks.filter((task) => task.status !== 'completed' && task.status !== 'deferred').length} totalMinutes={totalMinutes} explanation={explanation} loading={loading} />
            <CurrentActionCard task={activeTask} started={started} rejectOpen={rejectOpen} onStart={() => { setStarted(true); setNotice(''); }} onComplete={completeCurrent} onDefer={deferCurrent} onReject={() => setRejectOpen(true)} onShrink={() => updateRejectedTask('shrink')} onTomorrow={() => updateRejectedTask('tomorrow')} onRemove={() => updateRejectedTask('remove')} />
            <UpcomingTasks tasks={upcoming} />
          </div>
          <aside className="home-rail">
            <EnergyAdjuster energy={draftEnergy} minutes={draftMinutes} checkinCount={checkinCount} previewCount={preview.visibleTasks.length} previewMinutes={preview.totalMinutes} onEnergyChange={setDraftEnergy} onMinutesChange={setDraftMinutes} onConfirm={adjustByEnergy} />
            <NextCheckupCard checkup={checkups[0]} onOpen={() => onOpenFlow(1)} />
            <div className="home-boundary-note"><Info size={17} /><p>任务建议不替代医生意见；不适时先停止活动并联系专业人员。</p></div>
            <HomeQuickLinks onOpenFlow={onOpenFlow} />
          </aside>
        </div>
      </main>
      <ProfileEditor open={profileOpen} profile={profile} today={today} onClose={closeProfile} onSave={saveProfile} />
    </div>
  </div>;
}

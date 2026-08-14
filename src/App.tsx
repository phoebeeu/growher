import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  INITIAL_CHECKUPS,
  INITIAL_DAILY_SUMMARY,
  INITIAL_ENERGY_CHECKIN,
  INITIAL_MILESTONES,
  INITIAL_NON_WORK_GOALS,
  INITIAL_TODAY_TASKS,
  INITIAL_WEEKLY_FOCUS_TASKS,
  INITIAL_WORK_SCHEDULE,
} from './mockData';
import { CheckupNode, DailySummary, EnergyCheckin, Milestone, NonWorkGoal, TodayTask, WeeklyFocusTask, WorkSchedule } from './types';
import { Header } from './components/Header';
import { Page1GoalPanorama } from './components/pages/Page1GoalPanorama';
import { Page2WeeklyFocus } from './components/pages/Page2WeeklyFocus';
import { Page3TodayStatusTasks } from './components/pages/Page3TodayStatusTasks';
import { Page4ActionExecution } from './components/pages/Page4ActionExecution';
import { Page5SummaryTomorrow } from './components/pages/Page5SummaryTomorrow';
import { TodayHomePage } from './components/home/TodayHomePage';
import { PreviewGate } from './preview/PreviewGate';

const PAGE_TITLES = [
  '目标设定与全景图',
  '本周时间与重点确认',
  '今日状态与任务',
  '行动执行与重排',
  '今日总结与明日计划',
];

function ProductApp() {
  const [view, setView] = useState<'home' | 'flow'>('home');
  const [currentStep, setCurrentStep] = useState(1);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>(INITIAL_WORK_SCHEDULE);
  const [goals, setGoals] = useState<NonWorkGoal[]>(INITIAL_NON_WORK_GOALS);
  const [checkups, setCheckups] = useState<CheckupNode[]>(INITIAL_CHECKUPS);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [weeklyFocusTasks, setWeeklyFocusTasks] = useState<WeeklyFocusTask[]>(INITIAL_WEEKLY_FOCUS_TASKS);
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>(INITIAL_TODAY_TASKS);
  const [energyCheckin, setEnergyCheckin] = useState<EnergyCheckin>(INITIAL_ENERGY_CHECKIN);
  const [summary, setSummary] = useState<DailySummary>(INITIAL_DAILY_SUMMARY);

  const resetCycle = () => {
    setWorkSchedule(INITIAL_WORK_SCHEDULE);
    setGoals(INITIAL_NON_WORK_GOALS);
    setCheckups(INITIAL_CHECKUPS);
    setMilestones(INITIAL_MILESTONES);
    setWeeklyFocusTasks(INITIAL_WEEKLY_FOCUS_TASKS);
    setTodayTasks(INITIAL_TODAY_TASKS);
    setEnergyCheckin(INITIAL_ENERGY_CHECKIN);
    setSummary(INITIAL_DAILY_SUMMARY);
    setCurrentStep(1);
  };

  const openFlow = (step: number) => {
    setCurrentStep(step);
    setView('flow');
  };

  if (view === 'home') {
    return <TodayHomePage initialTasks={todayTasks} initialEnergy={energyCheckin} checkups={checkups} onOpenFlow={openFlow} />;
  }

  return (
    <div className="app-stage">
      <div className="app-shell">
        <button type="button" className="flow-home-return" onClick={() => setView('home')}>← 返回今日首页</button>
        <Header currentStep={currentStep} totalSteps={5} onNavigate={setCurrentStep} title={PAGE_TITLES[currentStep - 1]} />
        <main className="app-main">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.16 }}>
              {currentStep === 1 && <Page1GoalPanorama workSchedule={workSchedule} onUpdateWorkSchedule={setWorkSchedule} goals={goals} onUpdateGoals={setGoals} checkups={checkups} onUpdateCheckups={setCheckups} milestones={milestones} onUpdateMilestones={setMilestones} onConfirmPanorama={() => setCurrentStep(2)} />}
              {currentStep === 2 && <Page2WeeklyFocus workSchedule={workSchedule} checkups={checkups} weeklyFocusTasks={weeklyFocusTasks} onUpdateWeeklyFocusTasks={setWeeklyFocusTasks} onConfirmWeeklyFocus={() => setCurrentStep(3)} />}
              {currentStep === 3 && <Page3TodayStatusTasks initialEnergy={energyCheckin} todayTasks={todayTasks} onUpdateTodayTasks={setTodayTasks} onUpdateEnergy={setEnergyCheckin} onConfirmTodaySchedule={() => setCurrentStep(4)} />}
              {currentStep === 4 && <Page4ActionExecution todayTasks={todayTasks} onUpdateTodayTasks={setTodayTasks} onGoToSummary={() => setCurrentStep(5)} />}
              {currentStep === 5 && <Page5SummaryTomorrow summary={summary} onUpdateSummary={setSummary} onRestartCycle={resetCycle} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PreviewGate search={window.location.search}>
      <ProductApp />
    </PreviewGate>
  );
}

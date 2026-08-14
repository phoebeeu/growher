export type PageState = 'empty' | 'loading' | 'success' | 'failure';

export type GoalCategory = 'work' | 'side_hustle' | 'exercise' | 'pregnancy';

export type TimeTag = '早上' | '上午' | '中午' | '下午' | '晚上';

export interface WorkSchedule {
  workDays: string[];
  startTime: string;
  endTime: string;
}

export interface NonWorkGoal {
  id: string;
  category: 'side_hustle' | 'exercise' | 'pregnancy';
  title: string;
  weeklyHours: number;
  targetDate: string;
}

export interface CheckupNode {
  id: string;
  title: string;
  date: string;
  time: string;
  notes: string;
}

export interface Milestone {
  id: string;
  category: 'side_hustle' | 'exercise' | 'pregnancy';
  goalTitle: string;
  title: string;
  startDate: string;
  endDate: string;
  estHours: number;
  status: 'active' | 'paused';
}

export interface WeeklyFocusTask {
  id: string;
  category: 'side_hustle' | 'exercise' | 'pregnancy';
  goalTitle: string;
  estHours: number;
  completionCondition: string;
  firstAction: string;
  suggestedDate: string;
  timeTag: TimeTag;
  isPaused?: boolean;
}

export interface TodayTask {
  id: string;
  category: 'side_hustle' | 'exercise' | 'pregnancy';
  goalTitle: string;
  title: string;
  estMinutes: number;
  completionCondition: string;
  timeTag: TimeTag;
  isCurrentAction?: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'deferred' | 'shrunk';
  adjustmentNote?: string;
}

export interface EnergyCheckin {
  energyLevel: 1 | 2 | 3;
  availableMinutes: number;
  reason: string;
  checkinCount: 1 | 2;
  timestamp: string;
}

export interface DailySummary {
  date: string;
  completedTasks: TodayTask[];
  uncompletedTasks: TodayTask[];
  rearrangedTasks: TodayTask[];
  actualHours: number;
  firstEnergy: number;
  secondEnergy?: number;
  patternInsight: string;
  tomorrowFirstStep: {
    title: string;
    goalTitle: string;
    suggestedTimeTag: TimeTag;
  };
}

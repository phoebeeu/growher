import {
  WorkSchedule,
  NonWorkGoal,
  CheckupNode,
  Milestone,
  WeeklyFocusTask,
  TodayTask,
  EnergyCheckin,
  DailySummary,
} from './types';

export const INITIAL_WORK_SCHEDULE: WorkSchedule = {
  workDays: ['周一', '周二', '周三', '周四', '周五'],
  startTime: '09:00',
  endTime: '18:00',
};

export const INITIAL_NON_WORK_GOALS: NonWorkGoal[] = [
  {
    id: 'g1',
    category: 'side_hustle',
    title: '小红书孕期母婴科普账号搭建与首月选题',
    weeklyHours: 6,
    targetDate: '2026-10-15',
  },
  {
    id: 'g2',
    category: 'exercise',
    title: '孕中期孕妇瑜伽与低强度步态训练',
    weeklyHours: 4,
    targetDate: '2026-11-30',
  },
  {
    id: 'g3',
    category: 'pregnancy',
    title: '完成待产包清单采购与月子中心筛选',
    weeklyHours: 5,
    targetDate: '2026-09-20',
  },
];

export const INITIAL_CHECKUPS: CheckupNode[] = [
  {
    id: 'c1',
    title: '孕16周大排畸与唐氏筛查',
    date: '2026-08-15',
    time: '09:00',
    notes: '需空腹，带上既往产检本与身份证',
  },
  {
    id: 'c2',
    title: '孕20周常规例行产检与血糖筛查',
    date: '2026-09-01',
    time: '14:00',
    notes: '测量宫高腹围，监听胎心音',
  },
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    category: 'pregnancy',
    goalTitle: '完成待产包清单采购与月子中心筛选',
    title: '梳理入院待产包清单（妈妈篇与宝宝篇）',
    startDate: '2026-08-07',
    endDate: '2026-08-18',
    estHours: 6,
    status: 'active',
  },
  {
    id: 'm2',
    category: 'side_hustle',
    goalTitle: '小红书孕期母婴科普账号搭建与首月选题',
    title: '完成 5 篇孕期营养食谱文案拆解',
    startDate: '2026-08-10',
    endDate: '2026-08-25',
    estHours: 8,
    status: 'active',
  },
  {
    id: 'm3',
    category: 'exercise',
    goalTitle: '孕中期孕妇瑜伽与低强度步态训练',
    title: '完成 8 次骨盆稳定与呼吸控制瑜伽跟练',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    estHours: 8,
    status: 'active',
  },
  {
    id: 'm4',
    category: 'side_hustle',
    goalTitle: '小红书孕期母婴科普账号搭建与首月选题',
    title: '试拍并剪辑首支 1 分钟孕妈日常 Vlog',
    startDate: '2026-08-26',
    endDate: '2026-09-05',
    estHours: 5,
    status: 'paused', // Paused due to conflict / high workload
  },
];

export const INITIAL_WEEKLY_FOCUS_TASKS: WeeklyFocusTask[] = [
  {
    id: 'wf1',
    category: 'pregnancy',
    goalTitle: '完成待产包清单采购与月子中心筛选',
    estHours: 3,
    completionCondition: '整理出包含新生儿服装、妈妈洗护用品的待产清单 Excel',
    firstAction: '打开备忘录列出产房必备洗护用品清单',
    suggestedDate: '2026-08-08 (周六)',
    timeTag: '上午',
  },
  {
    id: 'wf2',
    category: 'side_hustle',
    goalTitle: '小红书孕期母婴科普账号搭建与首月选题',
    estHours: 2,
    completionCondition: '撰写完成《孕中期补钙食谱指南》大纲与3张文案草图',
    firstAction: '搜索小红书近30天高赞孕妇补钙笔记大纲',
    suggestedDate: '2026-08-09 (周日)',
    timeTag: '下午',
  },
  {
    id: 'wf3',
    category: 'exercise',
    goalTitle: '孕中期孕妇瑜伽与低强度步态训练',
    estHours: 1.5,
    completionCondition: '完成 2 次 25 分钟孕妇拉伸瑜伽与低强度步态跟练',
    firstAction: '铺好瑜伽垫并开启 B 站 20 分钟骨盆稳定训练课程',
    suggestedDate: '2026-08-07 (今天)',
    timeTag: '晚上',
  },
];

export const INITIAL_TODAY_TASKS: TodayTask[] = [
  {
    id: 't1',
    category: 'pregnancy',
    goalTitle: '完成待产包清单采购与月子中心筛选',
    title: '核对待产包洗护用品清单',
    estMinutes: 25,
    completionCondition: '勾选完成待产包中洗护用品缺失项目并加入购物车',
    timeTag: '上午',
    isCurrentAction: true,
    status: 'pending',
  },
  {
    id: 't2',
    category: 'exercise',
    goalTitle: '孕中期孕妇瑜伽与低强度步态训练',
    title: '20 分钟孕妇盆底肌与骨盆稳定瑜伽拉伸',
    estMinutes: 20,
    completionCondition: '跟练视频完成全程，无明显腹部不适',
    timeTag: '中午',
    isCurrentAction: false,
    status: 'pending',
  },
  {
    id: 't3',
    category: 'side_hustle',
    goalTitle: '小红书孕期母婴科普账号搭建与首月选题',
    title: '拆解 3 篇高赞孕妇补钙小红书文案结构',
    estMinutes: 30,
    completionCondition: '总结出开头吸引点与 3 个核心黄金知识点',
    timeTag: '晚上',
    isCurrentAction: false,
    status: 'pending',
  },
];

export const INITIAL_ENERGY_CHECKIN: EnergyCheckin = {
  energyLevel: 2,
  availableMinutes: 75,
  reason: '昨晚睡眠尚可，下午稍感腰部酸胀，希望安排轻度节奏',
  checkinCount: 1,
  timestamp: '08:30 早上',
};

export const INITIAL_DAILY_SUMMARY: DailySummary = {
  date: '2026年8月7日 (周五)',
  completedTasks: [
    {
      id: 't1',
      category: 'pregnancy',
      goalTitle: '完成待产包清单采购与月子中心筛选',
      title: '核对待产包洗护用品清单',
      estMinutes: 25,
      completionCondition: '勾选完成待产包中洗护用品缺失项目',
      timeTag: '上午',
      status: 'completed',
    },
    {
      id: 't2',
      category: 'exercise',
      goalTitle: '孕中期孕妇瑜伽与低强度步态训练',
      title: '20 分钟孕妇盆底肌拉伸 (状态重排后缩小为10分钟轻度拉伸)',
      estMinutes: 10,
      completionCondition: '完成轻度腰部疏通拉伸',
      timeTag: '中午',
      status: 'completed',
      adjustmentNote: '因为第二次能量下降，从 20 分钟缩小为 10 分钟',
    },
  ],
  uncompletedTasks: [
    {
      id: 't3',
      category: 'side_hustle',
      goalTitle: '小红书孕期母婴科普账号搭建与首月选题',
      title: '拆解 3 篇高赞孕妇补钙小红书文案结构',
      estMinutes: 30,
      completionCondition: '总结出开头吸引点与 3 个黄金知识点',
      timeTag: '晚上',
      status: 'deferred',
      adjustmentNote: '顺延至明日上午执行',
    },
  ],
  rearrangedTasks: [],
  actualHours: 1.2,
  firstEnergy: 2,
  secondEnergy: 1,
  patternInsight:
    '数据分析表明：您在【上午 10:00 - 11:30】精力最为平稳，最适合完成 25-30 分钟的孕产清单与文案拆解；傍晚精力易有明显下降，建议自动切换为 10-15 分钟轻度拉伸或休息。',
  tomorrowFirstStep: {
    title: '打开手机备忘录，勾选待产包睡衣与一次性内裤清单规格',
    goalTitle: '完成待产包清单采购与月子中心筛选',
    suggestedTimeTag: '上午',
  },
};

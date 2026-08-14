import { TodayTask } from '../types';

export interface RecommendationResult {
  visibleTasks: TodayTask[];
  totalMinutes: number;
  explanation: string;
}

const ENERGY_TASK_LIMIT: Record<1 | 2 | 3, number> = {
  1: 1,
  2: 2,
  3: 3,
};

export function buildRecommendation(
  tasks: TodayTask[],
  energy: 1 | 2 | 3,
  availableMinutes: number,
): RecommendationResult {
  const candidates = tasks.filter((task) => task.status !== 'completed' && task.status !== 'deferred');
  const visibleTasks: TodayTask[] = [];
  let totalMinutes = 0;

  for (const candidate of candidates) {
    if (visibleTasks.length >= ENERGY_TASK_LIMIT[energy]) break;

    const shouldShrink = energy === 1 && visibleTasks.length === 0 && candidate.estMinutes > 10;
    const task = shouldShrink
      ? {
          ...candidate,
          estMinutes: 10,
          status: 'shrunk' as const,
          adjustmentNote: '当前能量较低，已缩小为 10 分钟版本',
        }
      : { ...candidate };

    if (visibleTasks.length > 0 && totalMinutes + task.estMinutes > availableMinutes) continue;

    visibleTasks.push(task);
    totalMinutes += task.estMinutes;
  }

  const normalizedTasks = visibleTasks.map((task, index) => ({
    ...task,
    isCurrentAction: index === 0,
  }));

  const explanation = normalizedTasks.length === 0
    ? '当前没有需要推进的任务，可以先休息或查看本周计划。'
    : energy === 1
      ? '今天只保留一项 10 分钟行动，剩余任务不视为失败。'
      : `根据当前能量与可用时间，保留 ${normalizedTasks.length} 项，共 ${totalMinutes} 分钟。`;

  return { visibleTasks: normalizedTasks, totalMinutes, explanation };
}

export function deferCurrentTask(tasks: TodayTask[], currentTaskId: string): TodayTask[] {
  let promoted = false;

  return tasks.map((task) => {
    if (task.id === currentTaskId) {
      return {
        ...task,
        status: 'deferred',
        isCurrentAction: false,
        adjustmentNote: '已调整至晚上 19:30',
      };
    }

    if (!promoted && task.status !== 'completed' && task.status !== 'deferred') {
      promoted = true;
      return { ...task, isCurrentAction: true };
    }

    return { ...task, isCurrentAction: false };
  });
}

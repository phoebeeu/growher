import test from 'node:test';
import assert from 'node:assert/strict';
import { TodayTask } from '../types';
import { buildRecommendation, deferCurrentTask } from './recommendation';

const tasks: TodayTask[] = [
  {
    id: 't1',
    category: 'pregnancy',
    goalTitle: '完成待产包准备',
    title: '核对待产包洗护用品清单',
    estMinutes: 25,
    completionCondition: '勾选缺失项目并加入购物车',
    timeTag: '上午',
    isCurrentAction: true,
    status: 'pending',
  },
  {
    id: 't2',
    category: 'exercise',
    goalTitle: '保持孕期运动',
    title: '完成孕妇拉伸',
    estMinutes: 20,
    completionCondition: '完成全程且无不适',
    timeTag: '中午',
    isCurrentAction: false,
    status: 'pending',
  },
  {
    id: 't3',
    category: 'side_hustle',
    goalTitle: '推进个人项目',
    title: '完成内容大纲',
    estMinutes: 30,
    completionCondition: '产出三级大纲',
    timeTag: '晚上',
    isCurrentAction: false,
    status: 'pending',
  },
];

test('low energy produces one ten-minute current action', () => {
  const result = buildRecommendation(tasks, 1, 10);

  assert.equal(result.visibleTasks.length, 1);
  assert.equal(result.visibleTasks[0].estMinutes, 10);
  assert.equal(result.visibleTasks[0].status, 'shrunk');
  assert.equal(result.visibleTasks[0].isCurrentAction, true);
  assert.equal(result.totalMinutes, 10);
});

test('medium energy keeps two tasks within available time', () => {
  const result = buildRecommendation(tasks, 2, 45);

  assert.deepEqual(result.visibleTasks.map((task) => task.id), ['t1', 't2']);
  assert.equal(result.totalMinutes, 45);
  assert.equal(result.visibleTasks.filter((task) => task.isCurrentAction).length, 1);
});

test('defer moves the selected task to 19:30 and promotes the next task', () => {
  const result = deferCurrentTask(tasks, 't1');

  assert.equal(result[0].status, 'deferred');
  assert.equal(result[0].isCurrentAction, false);
  assert.equal(result[0].adjustmentNote, '已调整至晚上 19:30');
  assert.equal(result[1].isCurrentAction, true);
});

test('completed and deferred tasks are not recommended again', () => {
  const unavailable: TodayTask[] = [
    { ...tasks[0], status: 'completed' },
    { ...tasks[1], status: 'deferred' },
    tasks[2],
  ];

  const result = buildRecommendation(unavailable, 3, 60);

  assert.deepEqual(result.visibleTasks.map((task) => task.id), ['t3']);
  assert.equal(result.visibleTasks[0].isCurrentAction, true);
});

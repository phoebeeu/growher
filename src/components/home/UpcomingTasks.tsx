import { Clock3 } from 'lucide-react';
import { TodayTask } from '../../types';
import { CategoryChip } from '../ui';

export function UpcomingTasks({ tasks }: { tasks: TodayTask[] }) {
  return <section className="upcoming-section">
    <div className="home-section-heading"><div><span className="eyebrow">UP NEXT</span><h2>接下来</h2></div><span className="home-muted">最多 2 项</span></div>
    <div className="upcoming-grid">
      {tasks.slice(0, 2).map((task) => <article className="home-card upcoming-task" key={task.id}>
        <div><CategoryChip category={task.category} /><span className="upcoming-task__time"><Clock3 size={14} />{task.timeTag}</span></div>
        <h3>{task.title}</h3>
        <p>{task.estMinutes} 分钟 · {task.status === 'shrunk' ? '已缩小' : task.status === 'deferred' ? '已顺延' : '待开始'}</p>
      </article>)}
      {tasks.length === 0 && <article className="home-card home-empty"><strong>没有更多任务</strong><p>今天的容量已经留有缓冲。</p></article>}
    </div>
  </section>;
}

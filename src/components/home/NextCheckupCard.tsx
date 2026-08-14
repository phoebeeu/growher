import { ArrowRight, CalendarDays } from 'lucide-react';
import { CheckupNode } from '../../types';
import { CheckupCalendarPattern } from './PregnancyPatterns';

export function NextCheckupCard({ checkup, onOpen }: { checkup?: CheckupNode; onOpen: () => void }) {
  return <section className="home-card checkup-card">
    <div className="checkup-card__pattern"><CheckupCalendarPattern /></div>
    <div className="home-section-heading"><div><span className="eyebrow">NEXT CHECKUP</span><h2>下一个产检</h2></div><CalendarDays size={20} /></div>
    {checkup ? <>
      <div className="checkup-card__date"><strong>8 月 15 日</strong><span>{checkup.time} · 还有 5 天</span></div>
      <h3>{checkup.title}</h3><p>{checkup.notes.replace('既往', '')}</p>
    </> : <div className="home-empty"><strong>暂未添加产检</strong><p>固定日期会显示在这里，不会被任务重排移动。</p></div>}
    <button type="button" className="home-link" onClick={onOpen}>查看产检安排<ArrowRight size={16} /></button>
  </section>;
}

import { ArrowRight } from 'lucide-react';

export function HomeQuickLinks({ onOpenFlow }: { onOpenFlow: (step: number) => void }) {
  return <nav className="home-quick-links" aria-label="快捷入口">
    <button type="button" onClick={() => onOpenFlow(2)}>查看本周全景<ArrowRight size={16} /></button>
    <button type="button" onClick={() => onOpenFlow(5)}>进入今日总结<ArrowRight size={16} /></button>
  </nav>;
}

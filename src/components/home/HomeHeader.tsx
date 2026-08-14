import { useState } from 'react';
import { Menu, UserRound } from 'lucide-react';
import { BellyProfilePattern } from './PregnancyPatterns';

interface HomeHeaderProps {
  pregnancyWeek: number;
  dateLabel: string;
  onOpenProfile: () => void;
  onOpenFlow: (step: number) => void;
}

const NAV_ITEMS = [
  { label: '今日', step: 0 },
  { label: '目标全景', step: 1 },
  { label: '本周计划', step: 2 },
  { label: '总结', step: 5 },
];

export function HomeHeader({ pregnancyWeek, dateLabel, onOpenProfile, onOpenFlow }: HomeHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const openFlow = (step: number) => {
    setMenuOpen(false);
    if (step !== 0) onOpenFlow(step);
  };

  return (
    <header className="home-header">
      <div className="home-brand"><span className="home-brand__mark"><BellyProfilePattern /></span><span>孕期目标推进助手</span></div>
      <nav className="home-nav" aria-label="主要导航">
        {NAV_ITEMS.map((item) => item.step === 0
          ? <button key={item.label} type="button" className="home-nav__item is-active" aria-current="page">{item.label}</button>
          : <button key={item.label} type="button" className="home-nav__item" onClick={() => openFlow(item.step)}>{item.label}</button>)}
      </nav>
      <div className="home-profile">
        <div className="home-profile__date"><strong>孕 {pregnancyWeek} 周</strong><span>{dateLabel}</span></div>
        <button type="button" className="home-profile__button" aria-label="打开个人资料" aria-haspopup="dialog" onClick={onOpenProfile}><UserRound size={20} /></button>
        <button
          type="button"
          className="home-menu-button"
          aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={menuOpen}
          aria-controls="home-mobile-menu"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <Menu size={21} />
        </button>
      </div>
      <nav id="home-mobile-menu" className="home-mobile-menu" aria-label="移动端导航" hidden={!menuOpen}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={item.step === 0 ? 'is-active' : undefined}
            aria-current={item.step === 0 ? 'page' : undefined}
            onClick={() => openFlow(item.step)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

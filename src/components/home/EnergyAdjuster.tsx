import { BatteryFull, BatteryLow, BatteryMedium, Sparkles } from 'lucide-react';

interface Props {
  energy: 1 | 2 | 3;
  minutes: number;
  checkinCount: 1 | 2;
  previewCount: number;
  previewMinutes: number;
  onEnergyChange: (value: 1 | 2 | 3) => void;
  onMinutesChange: (value: number) => void;
  onConfirm: () => void;
}

const ENERGY = [
  { value: 1 as const, label: '低能量', Icon: BatteryLow },
  { value: 2 as const, label: '一般', Icon: BatteryMedium },
  { value: 3 as const, label: '有余力', Icon: BatteryFull },
];
const MINUTES = [10, 20, 30, 45, 60];

export function EnergyAdjuster(p: Props) {
  const locked = p.checkinCount === 2;
  return <section className="home-card energy-adjuster">
    <div className="home-section-heading"><div><span className="eyebrow">ENERGY CHECK</span><h2>现在的能量变了吗？</h2></div><span className="check-count">{p.checkinCount}/2</span></div>
    <p className="home-muted">用于改变任务长度和顺序，不是健康或心理测评。</p>
    <div className="home-energy-grid">
      {ENERGY.map(({ value, label, Icon }) => <button key={value} type="button" disabled={locked} aria-pressed={p.energy === value} onClick={() => p.onEnergyChange(value)}><Icon size={20} /><span>{label}</span></button>)}
    </div>
    <div className="minute-picker"><span>现在可以拿出</span><div>{MINUTES.map((value) => <button key={value} type="button" disabled={locked} aria-pressed={p.minutes === value} onClick={() => p.onMinutesChange(value)}>{value === 60 ? '60+' : value}</button>)}</div><small>分钟</small></div>
    <div className="adjust-preview"><Sparkles size={18} /><p>{locked ? '今日两次状态确认已完成，任务安排保持不变。' : `调整后将保留 ${p.previewCount} 项，共 ${p.previewMinutes} 分钟。`}</p></div>
    <button type="button" className="home-button home-button--secondary home-button--full" disabled={locked} onClick={p.onConfirm}>{locked ? '今日已确认 2/2' : '按当前状态调整'}</button>
  </section>;
}

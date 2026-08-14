import { useState } from 'react';
import { BellyHandsDoodle, PetalDoodle } from './WarmWindowDoodles';

const energyChoices = [
  { value: 1, label: '较少' },
  { value: 2, label: '一般' },
  { value: 3, label: '较多' },
] as const;

export function WarmWindowPreview() {
  const [energy, setEnergy] = useState<number>(2);
  const [started, setStarted] = useState(false);

  return (
    <div className="warm-window-stage">
      <main className="warm-window-shell">
        <section className="warm-window-hero" aria-labelledby="warm-window-title">
          <div className="warm-window-hero__topline">
            <a className="warm-window-back-link" href="/">返回当前版本</a>
            <span className="warm-window-step">04 / 05</span>
          </div>

          <div className="warm-window-brand-row">
            <p className="warm-window-brand">推进</p>
            <p className="warm-window-date">AUG 13 · PM</p>
          </div>

          <div className="warm-window-hero__copy">
            <p className="warm-window-kicker">今日 · 暖窗</p>
            <p className="warm-window-week"><span>18</span> 周 + 5 天</p>
            <h1 id="warm-window-title">现在只做这一步</h1>
            <p>按你此刻的状态，把今天缩小到可以开始。</p>
          </div>

          <BellyHandsDoodle />
          <PetalDoodle />
        </section>

        <div className="warm-window-paper">
          <div className="warm-window-status-dots" aria-label="今日状态：待产准备，中等能量，下午时段">
            <span className="warm-window-dot warm-window-dot--coral" />
            <span className="warm-window-dot warm-window-dot--cobalt" />
            <span className="warm-window-dot warm-window-dot--muted" />
          </div>

          <section className="warm-window-action" data-current-action="true" aria-labelledby="warm-window-action-title">
            <div className="warm-window-section-heading">
              <p>NOW · 当前行动</p>
              <span>01</span>
            </div>

            <div className="warm-window-meta-row">
              <span><i className="warm-window-source-dot" />待产准备</span>
              <span><b>25</b> min</span>
              <span>下午 15:30</span>
            </div>

            <h2 id="warm-window-action-title">核对待产包的洗护用品</h2>
            <p className="warm-window-action__description">
              先不购买，也不一次整理完。今天只确认还缺什么，让下一次行动更轻。
            </p>

            <div className="warm-window-first-step">
              <p>第一步</p>
              <strong>打开清单，只勾出还缺的 3 件用品</strong>
            </div>

            <div className="warm-window-secondary-actions">
              <button type="button">晚点可以</button>
              <button type="button">今天不行</button>
            </div>
          </section>

          <section className="warm-window-energy" aria-labelledby="warm-window-energy-title">
            <div className="warm-window-section-heading">
              <p id="warm-window-energy-title">ENERGY · 此刻能量</p>
              <span>2 / 2</span>
            </div>
            <div className="warm-window-energy__content">
              <p>如果状态变了，就在这里重新告诉我。</p>
              <div className="warm-window-energy__choices">
                {energyChoices.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    aria-pressed={energy === choice.value}
                    onClick={() => setEnergy(choice.value)}
                  >
                    <b>{choice.value}</b>
                    <span>{choice.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="warm-window-checkup" aria-labelledby="warm-window-checkup-title">
            <div>
              <p>CHECKUP · 固定安排</p>
              <time dateTime="2026-08-15T09:00">08 / 15 · 09:00</time>
            </div>
            <div className="warm-window-checkup__detail">
              <h2 id="warm-window-checkup-title">孕中期常规产检</h2>
              <span>FIXED</span>
            </div>
          </section>
        </div>

        <div className="warm-window-bottom-action">
          <button
            type="button"
            data-primary-action="true"
            onClick={() => setStarted((current) => !current)}
          >
            {started ? '正在进行 · 25 分钟' : '现在开始'}
          </button>
        </div>
      </main>
    </div>
  );
}

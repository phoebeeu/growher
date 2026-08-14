# 开发版0814快速视觉统一 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不重做五页布局和业务逻辑的前提下，让五步流程与今日推荐首页共用 `DESIGN.md｜开发版0814` 的颜色、字体、间距、按钮、卡片和交互状态，并用自动检查阻止后续样式漂移。

**Architecture:** 保留 `TodayHomePage` 与五个流程页面的 React 结构，只整理 `src/index.css` 的全局设计令牌和通用组件样式。`scripts/validate-design.mjs` 作为机器可执行的设计合同：先增加会失败的规则，再修改 CSS 让规则通过；首页使用全局令牌别名，避免维护两套相同色值。

**Tech Stack:** React 19、TypeScript 5.8、Vite 6、CSS、Node.js 设计合同脚本、tsx tests。

## Global Constraints

- 唯一视觉规范：仓库根目录 `DESIGN.md`，版本名“开发版0814”。
- 本轮不重新设计五页桌面布局，不修改任务拆解、能量重排、产检固定日期或总结逻辑。
- Website 首页桌面外壳最大 `1180px`；五步任务流程继续使用最大 `480px` 的聚焦外壳。
- 全局中文字体：`Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif`。
- 数字、日期、步骤编号和英文标签：`Martian Mono, ui-monospace, SFMono-Regular, Consolas, monospace`。
- 基础间距为 `4px`；只使用设计规范列出的间距值。
- 点击热区不得小于 `44×44px`；输入框高度 `52px`；主按钮高度 `52px`。
- 正文不得使用 `#000000`；不得使用 Inter；不得自动移动固定产检；不得增加第三次每日能量确认。
- `prefers-reduced-motion: reduce` 下循环动画停止，位移转场降为 `1ms` 透明度切换。
- 本轮无需新增账号；GitHub 已授权，本地开发和验证不调用 Gemini、数据库或部署服务。

---

### Task 1: 把开发版0814颜色和字体写成机器可检查的规则

**大白话说明：** 先让程序知道“什么才算符合设计”。如果以后有人把 Inter、旧橙色或旧纸面色重新写回来，检查会直接报错。

**Files:**
- Modify: `scripts/validate-design.mjs`
- Modify: `src/index.css`
- Test: `npm run test:design`

**Interfaces:**
- Consumes: `DESIGN.md` 第 4、5、6 节中的固定色值、字体栈和尺寸。
- Produces: `src/index.css` 中唯一的全局令牌；后续首页和五步流程都通过这些令牌取值。

- [ ] **Step 1: 在设计合同中增加会失败的令牌检查**

在 `required` 数组加入以下规则：

```js
['stage blue token', css, /--color-stage:\s*#285D91/i],
['canvas token', css, /--color-background:\s*#F7F2E9/i],
['surface token', css, /--color-surface:\s*#FFFDF8/i],
['muted surface token', css, /--color-surface-muted:\s*#ECE8DE/i],
['ink token', css, /--color-primary:\s*#20243B/i],
['screen blue token', css, /--color-screen-blue:\s*#354E84/i],
['screen purple token', css, /--color-screen-purple:\s*#332370/i],
['screen orange token', css, /--color-accent:\s*#E28144/i],
['screen yellow token', css, /--color-screen-yellow:\s*#FFFF6F/i],
['design border token', css, /--color-border:\s*#BCC7D7/i],
['system error token', css, /--color-danger:\s*#A63D4B/i],
['ui font token', css, /--font-ui:\s*"Noto Sans SC",\s*"PingFang SC",\s*"Microsoft YaHei",\s*system-ui,\s*sans-serif/],
['data font token', css, /--font-data:\s*"Martian Mono",\s*ui-monospace,\s*SFMono-Regular,\s*Consolas,\s*monospace/],
```

在 `forbidden` 数组加入：

```js
['Inter font family', css, /font-family:\s*Inter\b/i],
['legacy canvas color', css, /#F7F4EE/i],
['legacy orange color', css, /#E87845/i],
```

- [ ] **Step 2: 运行设计合同，确认它会失败**

Run: `npm run test:design`

Expected: `DESIGN CONTRACT FAILED`，并至少列出 `stage blue token`、`ui font token`、`Inter font family` 和旧色值错误。

- [ ] **Step 3: 用开发版0814令牌替换 `:root`**

`src/index.css` 的 `:root` 必须包含以下定义，并保留已有尺寸令牌：

```css
:root {
  --font-ui: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  --font-data: "Martian Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
  font-family: var(--font-ui);
  color: #20243B;
  background: #285D91;
  font-synthesis: none;
  text-rendering: optimizeLegibility;

  --app-width: 390px;
  --app-max-width: 480px;
  --app-bar-height: 56px;
  --action-bar-height: 80px;

  --color-stage: #285D91;
  --color-background: #F7F2E9;
  --color-surface: #FFFDF8;
  --color-surface-muted: #ECE8DE;
  --color-primary: #20243B;
  --color-text-muted: #666B7A;
  --color-screen-blue: #354E84;
  --color-screen-purple: #332370;
  --color-accent: #E28144;
  --color-screen-yellow: #FFFF6F;
  --color-border: #BCC7D7;
  --color-focus: #332370;
  --color-danger: #A63D4B;
  --color-danger-soft: #F8E0E3;
  --color-success: #3E866F;
  --color-success-soft: #DDEEE7;
  --color-warning: #C7833A;
  --color-warning-soft: #F5E6CF;
  --color-accent-soft: #F8E4D6;

  --category-work: #65728A;
  --category-side: #C86A32;
  --category-exercise: #3E866F;
  --category-pregnancy: #C05F78;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --radius-input: 8px;
  --radius-control: 10px;
  --radius-card: 12px;
  --shadow-control: 3px 3px 0 #20243B;
  --shadow-card: 0 4px 12px rgba(32, 36, 59, 0.08);
}
```

数字、步骤、日期和英文标签统一使用：

```css
.app-bar__step,
.page-kicker,
.caption,
.eyebrow,
.broadcast-panel small,
.broadcast-panel__header strong,
.broadcast-panel__header > span {
  font-family: var(--font-data);
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: 运行设计合同和 TypeScript 检查**

Run: `npm run test:design`

Expected: `DESIGN CONTRACT PASSED`。

Run: `npm run lint`

Expected: exit code `0`，无 TypeScript 错误。

- [ ] **Step 5: 提交令牌基线**

```bash
git add scripts/validate-design.mjs src/index.css
git commit -m "style: align global tokens with design 0814"
```

---

### Task 2: 统一五步流程的外壳和通用组件

**大白话说明：** 这一任务不动五页内容，只把它们共同使用的“墙纸、字体、按钮、输入框和卡片”换成同一套规范，因此改动小、影响面清楚。

**Files:**
- Modify: `scripts/validate-design.mjs`
- Modify: `src/index.css`
- Test: `npm run test:design`
- Test: `npm test`

**Interfaces:**
- Consumes: Task 1 生成的全局令牌。
- Produces: `.app-stage`、`.app-shell`、`.card`、`.button-*`、`.field`、`.accordion`、`.task-card` 和 `.energy-option` 的统一视觉。

- [ ] **Step 1: 为组件尺寸增加失败检查**

在 `required` 数组加入：

```js
['8 px input radius token', css, /--radius-input:\s*8px/],
['10 px control radius token', css, /--radius-control:\s*10px/],
['12 px card radius token', css, /--radius-card:\s*12px/],
['52 px primary button', css, /\.button-primary\s*\{[\s\S]*?min-height:\s*52px/],
['52 px input', css, /\.field,[\s\S]*?min-height:\s*52px/],
['stage uses design token', css, /\.app-stage\s*\{[\s\S]*?background:\s*var\(--color-stage\)/],
['card uses design radius', css, /\.card\s*\{[\s\S]*?border-radius:\s*var\(--radius-card\)/],
['purple focus ring', css, /outline:\s*2px solid var\(--color-focus\)/],
```

- [ ] **Step 2: 运行检查，确认旧组件样式不通过**

Run: `npm run test:design`

Expected: FAIL，并列出主按钮、输入框、外壳、卡片或焦点环中的缺失规则。

- [ ] **Step 3: 更新通用组件样式**

在 `src/index.css` 中按以下规则修改现有选择器：

```css
html,
body {
  background: var(--color-stage);
}

.app-stage {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  background: var(--color-stage);
}

.app-shell {
  width: 100%;
  max-width: var(--app-max-width);
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-background);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 20px 64px rgba(18, 26, 54, 0.24);
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.card,
.task-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.field,
.select-field,
.text-area {
  width: 100%;
  min-height: 52px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  background: var(--color-surface);
  color: var(--color-primary);
  padding: 10px 14px;
}

.button-primary {
  width: 100%;
  min-height: 52px;
  border: 1px solid rgba(32, 36, 59, 0.24);
  border-radius: var(--radius-control);
  background: var(--color-accent);
  color: var(--color-primary);
  box-shadow: var(--shadow-control);
}

.button-secondary {
  min-height: 48px;
  border: 1px solid rgba(32, 36, 59, 0.24);
  border-radius: var(--radius-control);
  background: var(--color-screen-purple);
  color: #FFFFFF;
  box-shadow: var(--shadow-control);
}

.button-primary:active,
.button-secondary:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #20243B;
}

@media (min-width: 700px) {
  .app-shell {
    border-radius: 20px;
  }
}
```

同步把 `.accordion`、`.timeline-item`、`.energy-option` 和 `.status-panel` 的圆角改为 `var(--radius-card)`，把输入框聚焦边框改为 `2px solid var(--color-focus)`。

- [ ] **Step 4: 验证组件规则和交互测试**

Run: `npm run test:design`

Expected: PASS。

Run: `npm test`

Expected: 21 个测试全部通过，失败数为 `0`。

Run: `npm run lint`

Expected: exit code `0`。

- [ ] **Step 5: 提交通用组件统一**

```bash
git add scripts/validate-design.mjs src/index.css
git commit -m "style: unify five-step flow components"
```

---

### Task 3: 让今日首页和五步流程真正共用同一套令牌

**大白话说明：** 今日首页现在自己又写了一遍蓝、紫、橙、黄。这里把它改成引用全局令牌，以后改一次颜色，两边会一起变化。

**Files:**
- Modify: `scripts/validate-design.mjs`
- Modify: `src/index.css`
- Test: `npm run test:design`
- Test: `npm test`

**Interfaces:**
- Consumes: Task 1 的 `--color-*` 和 `--font-*` 令牌。
- Produces: `.today-home-stage` 的 `--home-*` 别名；现有首页组件接口和状态逻辑不变。

- [ ] **Step 1: 增加首页令牌别名检查**

在 `required` 数组加入：

```js
['home stage aliases global stage', css, /--home-stage:\s*var\(--color-stage\)/],
['home canvas aliases global canvas', css, /--home-canvas:\s*var\(--color-background\)/],
['home screen aliases global screen', css, /--home-screen:\s*var\(--color-screen-blue\)/],
['home purple aliases global purple', css, /--home-purple:\s*var\(--color-screen-purple\)/],
['home orange aliases global accent', css, /--home-orange:\s*var\(--color-accent\)/],
['home yellow aliases global yellow', css, /--home-yellow:\s*var\(--color-screen-yellow\)/],
```

- [ ] **Step 2: 运行检查，确认重复硬编码会失败**

Run: `npm run test:design`

Expected: FAIL，并列出六个首页令牌别名。

- [ ] **Step 3: 把首页令牌改为全局别名**

```css
.today-home-stage {
  --home-stage: var(--color-stage);
  --home-canvas: var(--color-background);
  --home-surface: var(--color-surface);
  --home-muted: var(--color-surface-muted);
  --home-screen: var(--color-screen-blue);
  --home-purple: var(--color-screen-purple);
  --home-orange: var(--color-accent);
  --home-yellow: var(--color-screen-yellow);
  --home-ink: var(--color-primary);
  --home-ink-muted: var(--color-text-muted);
  --home-border: var(--color-border);
  min-height: 100vh;
  color: var(--home-ink);
  background: var(--home-stage);
  font-family: var(--font-ui);
}
```

将 `.flow-home-return` 的背景、边框、字体和焦点状态改为全局令牌，并保留“返回今日首页”文字和点击行为。

- [ ] **Step 4: 运行自动验证**

Run: `npm run test:design`

Expected: PASS。

Run: `npm test`

Expected: 21 个测试全部通过。

Run: `npm run lint`

Expected: exit code `0`。

- [ ] **Step 5: 提交首页与流程令牌合并**

```bash
git add scripts/validate-design.mjs src/index.css
git commit -m "style: share design tokens across product views"
```

---

### Task 4: 补齐项目入口说明并做多尺寸验收

**大白话说明：** 最后确认网页在电脑、平板和手机都没有挤坏，并把小白也能看懂的运行入口写进 README。这里不接真实 AI，也不接数据库。

**Files:**
- Modify: `README.md`
- Verify: `src/index.css`
- Verify: `src/components/home/TodayHomePage.tsx`
- Verify: `src/components/pages/Page1GoalPanorama.tsx`
- Verify: `src/components/pages/Page2WeeklyFocus.tsx`
- Verify: `src/components/pages/Page3TodayStatusTasks.tsx`
- Verify: `src/components/pages/Page4ActionExecution.tsx`
- Verify: `src/components/pages/Page5SummaryTomorrow.tsx`

**Interfaces:**
- Consumes: 前三个任务完成后的样式和现有页面交互。
- Produces: 可从 GitHub 克隆、运行、测试并按文档继续开发的基线。

- [ ] **Step 1: 把 README 更新为项目入口**

README 使用以下结构：

```markdown
# Growher · 孕期目标推进助手

帮助孕期女性把工作外目标拆成周重点和当日行动，并在能量变化后重新安排。

## 当前范围

- 今日推荐 Website 首页
- 五步 MVP 交互流程
- 本地演示数据与个人资料保存
- 不包含真实 AI、数据库、日历推送和医疗建议

## 本地运行

1. 安装 Node.js 20 或更高版本。
2. 运行 `npm install`。
3. 运行 `npm run dev`。
4. 打开 `http://127.0.0.1:3000/`。

## 项目文档

- [DESIGN.md](./DESIGN.md)：开发版0814唯一视觉规范
- [MVP-PRD.md](./MVP-PRD.md)：MVP 功能范围
- [网页补充规范](./docs/reference/2026-08-10-today-homepage-website-design.md)：合并前来源，仅供追溯

## 验证命令

- `npm test`
- `npm run lint`
- `npm run test:design`
- `npm run build`
```

- [ ] **Step 2: 启动本地网页并检查四个宽度**

Run: `npm run dev`

依次检查：

- `1440×900`：今日首页双栏，内容最大宽度 `1180px`，无横向滚动。
- `768×1024`：今日首页保持两栏；五步流程保持居中 `480px` 外壳。
- `390×844`：首页单列；五步流程铺满宽度；所有按钮可点击。
- `320×720`：无横向滚动；三枚能量按钮文字不重叠。

逐页点击“目标全景、本周计划、今日状态、行动执行、今日总结”，确认：

- 页面正文没有 Inter 字体。
- 固定产检没有自动改期入口。
- 每天最多两次能量确认。
- 每页保留一个主操作。
- 空、加载、成功、失败四种演示状态仍能切换。

- [ ] **Step 3: 运行完整验证**

Run: `npm test`

Expected: 21 个测试通过，失败数 `0`。

Run: `npm run lint`

Expected: exit code `0`。

Run: `npm run test:design`

Expected: `DESIGN CONTRACT PASSED`。

Run: `npm run build`

Expected: Vite 输出 `built`，exit code `0`。

Run: `git diff --check`

Expected: 无输出，exit code `0`。

- [ ] **Step 4: 提交入口文档和验收修正**

```bash
git add README.md src/index.css scripts/validate-design.mjs
git commit -m "docs: document development baseline"
```

- [ ] **Step 5: 推送 GitHub 并核对远端提交**

```bash
git push origin main
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
```

Expected: `main` 与 `origin/main` 的提交 SHA 相同，工作区无未提交文件。
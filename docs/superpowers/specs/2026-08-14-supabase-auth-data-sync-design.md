# Growher Supabase 邮箱登录与数据同步技术设计

版本：1.0
日期：2026-08-14
状态：已完成产品确认，待用户审阅文档
适用项目：孕期目标推进助手（Growher / 推进）

## 1. 目标

把当前使用 `mockData` 与 React 本地状态的交互原型，升级为支持真实账号和跨设备数据同步的 MVP。

首轮交付必须实现：

1. 用户通过邮箱接收 6 位数字验证码登录。
2. 同一邮箱在电脑和手机登录后读取同一份数据。
3. 新用户从空白资料和目标开始，不自动写入演示数据。
4. 用户只能读取和修改自己的数据。
5. 现有五步主流程、今日推荐首页和 DESIGN.md 视觉规范保持不变。

## 2. 本轮范围

### 2.1 本轮做

- 邮箱 6 位数字验证码登录。
- 登录状态恢复与安全退出。
- 首次登录后的空白资料和目标设置。
- 用户资料、工作时间、目标、产检、本周计划、每日状态、今日任务和每日总结的云端保存。
- 手机、电脑和不同浏览器之间的数据同步。
- 加载、空、保存成功和失败状态。
- Supabase Row Level Security（RLS）用户数据隔离。
- 将线上页面从演示数据切换到真实用户数据。
- 保留内部测试用演示数据入口，但生产用户不可见。

### 2.2 本轮不做

- AI 目标拆解、本周计划生成、今日推荐或动态重排。
- 微信、手机号、密码或第三方社交账号登录。
- 系统通知、邮件提醒、短信提醒或日历同步。
- 病历、产检报告图片、检查结果、诊断、身份证或支付信息。
- 后台运营系统、付费订阅或多人协作。
- 离线编辑与复杂冲突合并。

AI API 是第二轮交付。本轮先确保 AI 后续依赖的账号、数据和权限基础可靠。

## 3. 方案选择

### 3.1 采用方案

- 前端与站点：继续使用现有 React + Vite，并由 Cloudflare Worker/静态资源托管在 `growher.site`。
- 登录：Supabase Auth 邮箱 OTP。
- 数据库：Supabase Postgres。
- 权限：Supabase RLS。
- 后续 AI：通过 Cloudflare Worker 的 `/api/ai/*` 服务端接口调用模型。

### 3.2 未采用方案

- Cloudflare D1 + 自建验证码：基础设施统一，但需要自行实现验证码、会话、滥用防护和邮件链路，首轮开发量更大。
- Firebase：认证成熟，但当前产品的目标、任务、产检与总结关系更适合关系型数据模型。

## 4. 系统边界

### 4.1 浏览器负责

- 展示登录、验证码、首次设置和现有产品页面。
- 使用 Supabase 公共项目地址和 publishable key 初始化客户端。
- 携带用户会话读取和写入本人数据。
- 显示明确的加载、未保存、失败和重试状态。

### 4.2 Supabase 负责

- 发送和验证邮箱 OTP。
- 管理用户身份与会话。
- 保存结构化产品数据。
- 通过 RLS 阻止跨用户访问。
- 通过数据库约束阻止不合法状态。

### 4.3 Cloudflare Worker 负责

- 继续托管现有网页与自定义域名。
- 第二轮承载 AI API，校验 Supabase 用户会话后调用模型。
- 保存 AI 服务密钥等服务端密钥。

首轮普通数据读写直接使用 Supabase 用户会话与 RLS，不增加一层重复的 CRUD Worker API。

## 5. 用户流程

### 5.1 未登录

1. 打开 `growher.site`。
2. 只显示登录页，不渲染任何用户数据。
3. 输入邮箱并选择“发送验证码”。
4. 页面进入验证码状态，显示 6 位输入框、修改邮箱和重新发送入口。
5. 输入验证码后调用 Supabase 验证。
6. 验证成功后建立会话并读取用户资料。

### 5.2 首次登录

1. 用户资料不存在或 `onboarding_completed = false`。
2. 进入空白资料与目标设置。
3. 保存昵称、预产期、工作时间和至少一个非工作目标。
4. 写入资料与目标后，将 `onboarding_completed` 更新为 `true`。
5. 进入今日推荐首页；没有计划时显示真实空状态，不加载演示任务。

### 5.3 再次登录

1. Supabase 恢复有效会话。
2. 读取用户资料与当天数据。
3. 已完成首次设置的用户直接进入今日推荐首页。
4. 会话失效时返回登录页；重新验证后读取原数据。

### 5.4 退出

1. 用户在个人资料中选择退出。
2. 清除 Supabase 会话和仅用于界面缓存的用户状态。
3. 返回登录页。
4. 退出后不得继续显示上一位用户的数据。

## 6. 数据模型

所有业务表使用 UUID 主键、`user_id` 外键、`created_at` 和 `updated_at`。日期按用户时区解释；默认时区为 `Asia/Shanghai`。

### 6.1 `profiles`

| 字段 | 规则 |
|---|---|
| `user_id` | UUID 主键，关联 `auth.users.id` |
| `display_name` | 1–30 个字符 |
| `due_date` | 日期；用于计算孕周，不存储诊断信息 |
| `manual_correction` | 是否使用用户手动校正的孕周，默认 `false` |
| `corrected_week` | 手动校正时为 0–42，可空 |
| `corrected_day` | 手动校正时为 0–6，可空 |
| `corrected_at` | 手动校正发生的用户本地日期，可空 |
| `timezone` | 默认 `Asia/Shanghai` |
| `work_days` | 1–7 的工作日数组 |
| `work_start` | 每日固定工作开始时间 |
| `work_end` | 每日固定工作结束时间，必须晚于开始时间 |
| `onboarding_completed` | 布尔值，默认 `false` |

### 6.2 `goals`

仅保存需要产品拆解的三类目标；工作只保存在固定工作时间中。

| 字段 | 规则 |
|---|---|
| `id` | UUID 主键 |
| `user_id` | 当前用户 |
| `category` | `side_hustle`、`exercise`、`pregnancy` |
| `title` | 必填，1–120 个字符 |
| `weekly_minutes` | 必须大于 0 |
| `target_date` | 必填，不早于创建日期 |
| `status` | `active`、`paused`、`completed`、`archived` |

目标删除采用归档，不物理删除历史执行记录。

### 6.3 `checkups`

| 字段 | 规则 |
|---|---|
| `id` | UUID 主键 |
| `user_id` | 当前用户 |
| `title` | 必填，1–120 个字符 |
| `occurs_at` | 带时区的日期时间 |
| `notes` | 可空，最多 500 个字符 |
| `is_fixed` | 固定为 `true`；AI 不得更改时间 |

### 6.4 `weekly_plans`

| 字段 | 规则 |
|---|---|
| `id` | UUID 主键 |
| `user_id` | 当前用户 |
| `week_start` | 周一日期 |
| `available_minutes` | 本周非工作可用分钟数，必须大于等于 0 |
| `confirmed_at` | 用户确认时间，可空 |

`user_id + week_start` 唯一，避免同一用户同一周出现两份主计划。

### 6.5 `weekly_tasks`

| 字段 | 规则 |
|---|---|
| `id` | UUID 主键 |
| `user_id` | 当前用户 |
| `weekly_plan_id` | 关联本周计划 |
| `goal_id` | 关联目标 |
| `title` | 任务名称 |
| `estimated_minutes` | 必须大于 0 |
| `completion_condition` | 明确的本周完成条件 |
| `first_action` | 可立即开始的第一步 |
| `suggested_date` | 建议执行日期，可由用户修改 |
| `time_tag` | `early_morning`、`morning`、`noon`、`afternoon`、`evening` |
| `status` | `planned`、`active`、`completed`、`deferred`、`cancelled` |
| `position` | 非负整数，用于显示顺序 |

### 6.6 `energy_checkins`

| 字段 | 规则 |
|---|---|
| `id` | UUID 主键 |
| `user_id` | 当前用户 |
| `local_date` | 用户本地日期 |
| `sequence` | 仅允许 1 或 2 |
| `energy_level` | 仅允许 1、2、3 |
| `available_minutes` | 必须大于等于 0 |
| `reason` | 可空，最多 300 个字符 |
| `recorded_at` | 实际记录时间 |

`user_id + local_date + sequence` 唯一。应用先查询当天已有次数，数据库约束作为第二道防线，禁止第三次记录。

### 6.7 `daily_tasks`

| 字段 | 规则 |
|---|---|
| `id` | UUID 主键 |
| `user_id` | 当前用户 |
| `weekly_task_id` | 可空，关联本周任务 |
| `local_date` | 用户本地日期 |
| `title` | 当日行动名称 |
| `estimated_minutes` | 必须大于 0 |
| `completion_condition` | 完成条件 |
| `time_tag` | 固定时段枚举 |
| `status` | `pending`、`in_progress`、`completed`、`deferred`、`shrunk`、`skipped` |
| `is_current` | 是否为当前唯一行动 |
| `adjustment_note` | 重排或缩小任务的说明，可空 |
| `completed_at` | 完成时间，可空 |

每个用户每天最多一条 `is_current = true` 的任务，通过部分唯一索引约束。

### 6.8 `daily_summaries`

| 字段 | 规则 |
|---|---|
| `id` | UUID 主键 |
| `user_id` | 当前用户 |
| `local_date` | 用户本地日期 |
| `actual_minutes` | 实际投入分钟数，必须大于等于 0 |
| `first_energy` | 当天第一次能量，可空 |
| `second_energy` | 当天第二次能量，可空 |
| `insight` | 系统发现，可空，最多 800 个字符 |
| `tomorrow_first_step` | 明日第一步，可空，最多 300 个字符 |
| `tomorrow_time_tag` | 明日建议时段，可空 |

`user_id + local_date` 唯一。

## 7. 权限与密钥

### 7.1 RLS

所有业务表默认拒绝访问，并启用 RLS。认证用户仅在以下条件成立时执行 `select`、`insert`、`update` 和允许的 `delete`：

```text
auth.uid() = user_id
```

关联写入同时验证父记录属于当前用户，不能仅凭外键 UUID 写入其他用户的计划或目标。

### 7.2 浏览器允许存在

- Supabase Project URL。
- Supabase publishable key。

两者写入 Cloudflare 的公开构建变量，不视为管理密钥；数据安全依赖用户会话与 RLS。

### 7.3 浏览器禁止存在

- Supabase `service_role` 或 secret key。
- AI 模型 API Key。
- 自定义 SMTP 密码。
- Cloudflare API Token。

这些密钥不得写入源码、GitHub、浏览器构建产物或客户端日志。

## 8. 前端模块边界

在现有组件之外增加以下职责单一的模块：

- `supabaseClient`：只负责初始化 Supabase 客户端。
- `AuthProvider`：只负责会话恢复、用户状态和退出。
- `AuthGate`：根据会话显示登录页或产品页。
- `LoginPage`：邮箱与验证码两阶段交互。
- `OnboardingGate`：根据资料状态决定进入首次设置或首页。
- `repositories/*`：按资料、目标、产检、计划、任务和总结拆分数据读写。
- `queryState`：统一处理加载、空、成功、失败与重试，不在页面中散落 Supabase 调用。

现有页面组件继续接收业务数据和回调；它们不直接知道 Supabase 表结构。

## 9. 演示数据切换

- 生产用户不自动写入 `mockData`。
- 新用户首次登录后看到空白资料和目标设置。
- 没有本周计划或今日任务时显示 PRD 定义的空状态。
- 内部演示数据只通过开发环境开关或指定内部测试账号加载。
- 演示开关不得出现在生产页面，也不得在真实账号保存失败时自动启用。

## 10. 失败处理

### 10.1 登录

- 邮箱格式错误：不发送请求，提示修改。
- 发送失败：保留邮箱并允许重试。
- 验证码错误：保留邮箱和验证码输入页，提示重新输入。
- 验证码过期：允许重新发送；UI 发送冷却为 60 秒。
- 验证成功但资料加载失败：保持已登录状态，显示重试，不进入演示数据。

### 10.2 数据保存

- 用户提交后显示“保存中”。
- Supabase 返回成功后才显示“已保存”。
- 保存失败时保留当前表单内容，显示“尚未保存”和重试入口。
- 禁止静默吞掉错误或用本地假成功覆盖失败状态。
- 首轮不实现多设备同时编辑的字段级合并；采用后写入覆盖，并保留 `updated_at` 用于后续冲突提示。

### 10.3 会话

- 会话恢复期间显示应用级加载状态，不短暂展示登录页或其他用户数据。
- 会话过期时清除内存中的用户数据并回到登录页。
- 重新登录后从 Supabase 重新读取，不复用上一位用户的缓存。

## 11. 测试与验收

### 11.1 自动测试

- 登录页邮箱校验、验证码状态切换、重新发送冷却。
- AuthGate 的加载、未登录、已登录三种状态。
- OnboardingGate 对首次用户和已有用户的分流。
- Repository 对成功、空结果、权限拒绝和网络失败的处理。
- 每天最多两次能量记录的应用校验。
- 现有推荐逻辑、个人资料和 DESIGN.md 检查继续通过。

### 11.2 Supabase 集成测试

- 用户 A 可读写本人数据。
- 用户 A 无法读取或修改用户 B 的数据。
- 未登录请求无法读取业务表。
- 第三次能量记录被拒绝。
- 同一用户同一天只有一条当前行动。
- `checkups.is_fixed` 不被计划更新流程改为 `false`。

### 11.3 上线验收

1. 新邮箱收到 6 位验证码并完成登录。
2. 新用户只看到空白资料和目标设置。
3. 完成设置后进入今日推荐首页。
4. 电脑保存资料后，手机使用同一邮箱登录可读取相同数据。
5. 刷新、关闭并重新打开网页后会话与数据正常恢复。
6. 退出后页面不再显示之前的数据。
7. 第二个账号看不到第一个账号的数据。
8. 网络失败时页面不显示假成功，也不加载演示数据。
9. GitHub 和构建产物中不存在管理密钥。
10. `npm run test:design`、`npm run lint`、`npm test` 和 `npm run build` 全部通过。

## 12. 上线顺序

1. 创建 Supabase 项目并配置 `growher.site`。
2. 配置邮箱 OTP 模板为 6 位数字验证码。
3. 创建数据库表、约束、索引和 RLS 策略。
4. 增加前端 Supabase 客户端与环境变量。
5. 完成登录、会话、退出和首次设置分流。
6. 按模块将 `mockData/useState` 切换为 Repository 数据读写。
7. 运行自动测试、权限测试和双设备验收。
8. 推送 GitHub，由 Cloudflare 自动部署。
9. 在生产环境完成新用户与双账号隔离复测。

## 13. 第二轮接口预留

本轮不调用 AI，但为以下服务端接口保留边界：

- `POST /api/ai/panorama`：目标拆解与全景图。
- `POST /api/ai/weekly-plan`：本周重点与第一步。
- `POST /api/ai/today-plan`：根据能量与时间生成今日行动。
- `POST /api/ai/rearrange`：第二次状态确认后的任务重排。
- `POST /api/ai/daily-summary`：事实汇总、规律和明日第一步。

每个接口必须验证 Supabase 会话，只读取当前用户所需的最少数据，并输出可校验的结构化 JSON。医疗诊断、检查解释和体重标准不属于接口职责。

## 14. 完成定义

当第 11.3 节十项上线验收全部通过，且线上 `growher.site` 可稳定完成邮箱登录、空白首次设置和跨设备数据同步时，本轮完成。AI 生成结果、提醒与日历能力不影响本轮完成判定。

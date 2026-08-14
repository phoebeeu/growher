# Supabase Email OTP and Data Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6-digit email OTP login and secure cross-device persistence to Growher without changing the confirmed five-step product flow or visual system.

**Architecture:** Keep the React/Vite application on Cloudflare and use Supabase Auth plus Postgres for identity and user-owned data. The browser uses the publishable key with the signed-in user's JWT; RLS enforces `auth.uid() = user_id`. Existing page components stay presentation-focused and consume an `AppRepository` interface instead of calling Supabase directly.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, `@supabase/supabase-js`, Supabase Auth/Postgres/RLS, Node test runner through `tsx`, Cloudflare Git deployment.

## Global Constraints

- Production URL remains `https://growher.site`.
- Login uses email plus a 6-digit one-time code; no password, phone, WeChat, or social login.
- New users start with empty profile and goal data; production never falls back to `mockData`.
- The browser may contain only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Never expose a Supabase secret/service-role key, SMTP password, Cloudflare API token, or AI API key.
- Every business table enables RLS and restricts rows to `auth.uid() = user_id`.
- Store no medical report, diagnosis, examination result, identity document, or payment data.
- Preserve `DESIGN.md`, the current homepage, and the five-page product flow.
- Keep fixed checkups immovable and enforce no more than two energy check-ins per user per local date.
- All existing checks plus new tests must pass before deployment.

---

## File Map

### Create

- `supabase/migrations/202608140001_auth_data_sync.sql` — tables, constraints, indexes, timestamps, and RLS.
- `src/lib/publicEnv.ts` — validate public build-time environment variables.
- `src/lib/publicEnv.test.ts` — environment contract tests.
- `src/lib/supabaseClient.ts` — one browser Supabase client.
- `src/auth/authService.ts` — email OTP and sign-out adapter.
- `src/auth/authService.test.ts` — auth validation and adapter tests.
- `src/auth/authState.ts` — pure auth/entry state decisions.
- `src/auth/authState.test.ts` — route decision tests.
- `src/auth/AuthProvider.tsx` — session restoration and auth context.
- `src/components/auth/LoginPage.tsx` — two-stage email/code UI.
- `src/components/auth/LoginPage.test.ts` — accessible static markup tests.
- `src/components/auth/AuthGate.tsx` — loading, login, onboarding, or product shell.
- `src/data/database.types.ts` — row and insert/update types used by repositories.
- `src/data/mappers.ts` — database/domain conversions.
- `src/data/mappers.test.ts` — conversion tests.
- `src/data/appRepository.ts` — repository interface and application snapshot.
- `src/data/supabaseAppRepository.ts` — Supabase implementation.
- `src/data/supabaseAppRepository.test.ts` — query/error contract tests with a fake client.
- `src/data/useAppData.ts` — load, save, retry, and mutation state.
- `src/data/useAppData.test.ts` — application data state transitions.
- `src/onboarding/onboardingState.ts` — onboarding completion rules.
- `src/onboarding/onboardingState.test.ts` — empty/complete user rules.
- `src/components/onboarding/OnboardingProfilePage.tsx` — first profile step.
- `src/components/onboarding/OnboardingProfilePage.test.ts` — first-step markup tests.
- `src/data/schema-contract.test.ts` — migration coverage guard.
- `src/data/persistence-flow.test.ts` — profile, goal, checkup, and weekly-plan saves.
- `src/data/daily-cycle.test.ts` — energy, daily task, and summary persistence.

### Modify

- `package.json` and `package-lock.json` — add Supabase client.
- `.env.example` — replace obsolete AI Studio variables with safe public Supabase variables.
- `src/types.ts` — align domain statuses and add persisted IDs where required.
- `src/home/profile.ts` — keep calculation/validation pure; remove production local-storage ownership.
- `src/home/profile.test.ts` — remove local-storage persistence expectations.
- `src/App.tsx` — replace `mockData/useState` bootstrap with auth and repository state.
- `src/main.tsx` — mount `AuthProvider`.
- `src/components/home/TodayHomePage.tsx` — receive profile and async mutation callbacks.
- `src/components/home/ProfileEditor.tsx` — await cloud save and expose saving/failure state.
- `src/components/home/ProfileEditor.test.ts` — verify saving and error copy.
- `src/components/pages/Page1GoalPanorama.tsx` — save work schedule, goals, and checkups.
- `src/components/pages/Page2WeeklyFocus.tsx` — save weekly plan and tasks.
- `src/components/pages/Page3TodayStatusTasks.tsx` — save first energy record and daily tasks.
- `src/components/pages/Page4ActionExecution.tsx` — persist task state and second check-in.
- `src/components/pages/Page5SummaryTomorrow.tsx` — persist daily summary.
- `src/index.css` — login/onboarding/loading/error styles using existing design tokens.
- `README.md` — real backend setup, local environment, checks, and deployment notes.

---

### Task 1: Public Supabase Configuration

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.env.example`
- Create: `src/lib/publicEnv.ts`
- Create: `src/lib/publicEnv.test.ts`
- Create: `src/lib/supabaseClient.ts`

**Interfaces:**
- Produces: `readPublicEnv(source: Record<string, unknown>): PublicEnv`
- Produces: `supabase: SupabaseClient`
- Consumes: `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`

- [ ] **Step 1: Write the failing public environment tests**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { readPublicEnv } from './publicEnv';

test('accepts the two public Supabase variables', () => {
  assert.deepEqual(readPublicEnv({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
  }), {
    supabaseUrl: 'https://example.supabase.co',
    supabasePublishableKey: 'sb_publishable_example',
  });
});

test('rejects missing public configuration without printing key values', () => {
  assert.throws(() => readPublicEnv({}), /Supabase public configuration is missing/);
});
```

- [ ] **Step 2: Run the focused test and verify red**

Run: `npx tsx --test src/lib/publicEnv.test.ts`

Expected: FAIL because `src/lib/publicEnv.ts` does not exist.

- [ ] **Step 3: Install the client and implement strict public configuration**

Run: `npm install @supabase/supabase-js`

```ts
export interface PublicEnv {
  supabaseUrl: string;
  supabasePublishableKey: string;
}

export function readPublicEnv(source: Record<string, unknown>): PublicEnv {
  const url = source.VITE_SUPABASE_URL;
  const key = source.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (typeof url !== 'string' || !/^https:\/\/.+\.supabase\.co$/.test(url)
    || typeof key !== 'string' || key.length < 20) {
    throw new Error('Supabase public configuration is missing or invalid');
  }
  return { supabaseUrl: url, supabasePublishableKey: key };
}
```

```ts
import { createClient } from '@supabase/supabase-js';
import { readPublicEnv } from './publicEnv';

const env = readPublicEnv(import.meta.env);
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
```

Set `.env.example` to exactly these public names with non-working examples; remove `GEMINI_API_KEY` and `APP_URL` from the browser template.

- [ ] **Step 4: Verify the focused test and type check**

Run: `npx tsx --test src/lib/publicEnv.test.ts`

Expected: 2 tests pass.

Run: `npm run lint`

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example src/lib/publicEnv.ts src/lib/publicEnv.test.ts src/lib/supabaseClient.ts
git commit -m "feat: add Supabase public client configuration"
```

---

### Task 2: Database Schema, Constraints, and RLS

**Files:**
- Create: `supabase/migrations/202608140001_auth_data_sync.sql`
- Create: `src/data/schema-contract.test.ts`

**Interfaces:**
- Produces: tables `profiles`, `goals`, `checkups`, `weekly_plans`, `weekly_tasks`, `energy_checkins`, `daily_tasks`, `daily_summaries`
- Produces: RLS policies named `<table>_own_select`, `<table>_own_insert`, `<table>_own_update`, `<table>_own_delete`
- Produces: composite ownership foreign keys and the one-current-task partial unique index

- [ ] **Step 1: Write the failing schema contract test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = new URL('../../supabase/migrations/202608140001_auth_data_sync.sql', import.meta.url);
const tables = ['profiles', 'goals', 'checkups', 'weekly_plans', 'weekly_tasks', 'energy_checkins', 'daily_tasks', 'daily_summaries'];

test('migration creates every MVP table with RLS', () => {
  const sql = readFileSync(migration, 'utf8');
  for (const table of tables) {
    assert.match(sql, new RegExp(`create table public\\.${table}`, 'i'));
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
  assert.match(sql, /unique \(user_id, local_date, sequence\)/i);
  assert.match(sql, /where is_current = true/i);
  assert.match(sql, /check \(is_fixed = true\)/i);
  assert.match(sql, /manual_correction boolean not null default false/i);
});
```

- [ ] **Step 2: Run the schema test and verify red**

Run: `npx tsx --test src/data/schema-contract.test.ts`

Expected: FAIL with migration file not found.

- [ ] **Step 3: Create the migration**

The migration must use this structure and exact ownership rules:

```sql
create extension if not exists pgcrypto;

create type public.goal_category as enum ('side_hustle', 'exercise', 'pregnancy');
create type public.time_tag as enum ('early_morning', 'morning', 'noon', 'afternoon', 'evening');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 30),
  due_date date not null,
  manual_correction boolean not null default false,
  corrected_week smallint check (corrected_week between 0 and 42),
  corrected_day smallint check (corrected_day between 0 and 6),
  corrected_at date,
  timezone text not null default 'Asia/Shanghai',
  work_days smallint[] not null default '{}',
  work_start time,
  work_end time,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (work_start is null or work_end is null or work_end > work_start),
  check (
    (manual_correction = false and corrected_week is null and corrected_day is null and corrected_at is null)
    or
    (manual_correction = true and corrected_week is not null and corrected_day is not null and corrected_at is not null)
  )
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category public.goal_category not null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  weekly_minutes integer not null check (weekly_minutes > 0),
  target_date date not null,
  status text not null default 'active' check (status in ('active','paused','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.checkups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  occurs_at timestamptz not null,
  notes text not null default '' check (char_length(notes) <= 500),
  is_fixed boolean not null default true check (is_fixed = true),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  available_minutes integer not null check (available_minutes >= 0),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start),
  unique (id, user_id)
);

create table public.weekly_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weekly_plan_id uuid not null,
  goal_id uuid not null,
  title text not null check (char_length(trim(title)) between 1 and 160),
  estimated_minutes integer not null check (estimated_minutes > 0),
  completion_condition text not null,
  first_action text not null,
  suggested_date date not null,
  time_tag public.time_tag not null,
  status text not null default 'planned' check (status in ('planned','active','completed','deferred','cancelled')),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (weekly_plan_id, user_id) references public.weekly_plans(id, user_id) on delete cascade,
  foreign key (goal_id, user_id) references public.goals(id, user_id) on delete restrict,
  unique (id, user_id)
);

create table public.energy_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  sequence smallint not null check (sequence in (1,2)),
  energy_level smallint not null check (energy_level in (1,2,3)),
  available_minutes integer not null check (available_minutes >= 0),
  reason text not null default '' check (char_length(reason) <= 300),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_date, sequence),
  unique (id, user_id)
);

create table public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weekly_task_id uuid,
  local_date date not null,
  title text not null check (char_length(trim(title)) between 1 and 160),
  estimated_minutes integer not null check (estimated_minutes > 0),
  completion_condition text not null,
  time_tag public.time_tag not null,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','deferred','shrunk','skipped')),
  is_current boolean not null default false,
  adjustment_note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (weekly_task_id, user_id) references public.weekly_tasks(id, user_id) on delete restrict,
  unique (id, user_id)
);

create unique index one_current_daily_task_per_user_date
  on public.daily_tasks(user_id, local_date) where is_current = true;

create table public.daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  actual_minutes integer not null check (actual_minutes >= 0),
  first_energy smallint check (first_energy in (1,2,3)),
  second_energy smallint check (second_energy in (1,2,3)),
  insight text check (char_length(insight) <= 800),
  tomorrow_first_step text check (char_length(tomorrow_first_step) <= 300),
  tomorrow_time_tag public.time_tag,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_date)
);

create function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.checkups enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.weekly_tasks enable row level security;
alter table public.energy_checkins enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.daily_summaries enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','goals','checkups','weekly_plans','weekly_tasks',
    'energy_checkins','daily_tasks','daily_summaries'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at', table_name
    );
    execute format(
      'create policy %I on public.%I for select to authenticated using (auth.uid() = user_id)',
      table_name || '_own_select', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (auth.uid() = user_id)',
      table_name || '_own_insert', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      table_name || '_own_update', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (auth.uid() = user_id)',
      table_name || '_own_delete', table_name
    );
  end loop;
end $$;
```

The loop creates one timestamp trigger and four own-row policies for each named table. Do not add any unauthenticated or cross-user policy.

- [ ] **Step 4: Run the contract test and apply the migration**

Run: `npx tsx --test src/data/schema-contract.test.ts`

Expected: PASS.

User handoff: ask the user to log in to Supabase. Create a project in the nearest available region, open SQL Editor, paste the committed migration, and run it once. Do not copy the database password or a secret key into chat, source files, or screenshots.

- [ ] **Step 5: Verify database objects and commit**

In Supabase Table Editor, verify all eight tables exist. In Authentication > Policies, verify every table has RLS enabled and four own-row policies.

```bash
git add supabase/migrations/202608140001_auth_data_sync.sql src/data/schema-contract.test.ts
git commit -m "feat: add secure Supabase schema"
```

---

### Task 3: Email OTP Service

**Files:**
- Create: `src/auth/authService.ts`
- Create: `src/auth/authService.test.ts`

**Interfaces:**
- Produces: `validateEmail(email: string): string | null`
- Produces: `validateOtp(token: string): string | null`
- Produces: `sendEmailOtp(client: AuthClient, email: string): Promise<void>`
- Produces: `verifyEmailOtp(client: AuthClient, email: string, token: string): Promise<void>`
- Produces: `signOut(client: AuthClient): Promise<void>`

- [ ] **Step 1: Write failing validation and adapter tests**

```ts
test('requires a valid email and exactly six digits', () => {
  assert.equal(validateEmail('bad'), '请输入有效邮箱');
  assert.equal(validateEmail('user@example.com'), null);
  assert.equal(validateOtp('12345'), '请输入 6 位验证码');
  assert.equal(validateOtp('123456'), null);
});

test('sends normalized email without creating a password flow', async () => {
  const calls: unknown[] = [];
  const client = fakeAuth({ signInWithOtp: async (input) => { calls.push(input); return { error: null }; } });
  await sendEmailOtp(client, ' User@Example.com ');
  assert.deepEqual(calls, [{ email: 'user@example.com', options: { shouldCreateUser: true } }]);
});
```

- [ ] **Step 2: Run the auth service tests and verify red**

Run: `npx tsx --test src/auth/authService.test.ts`

Expected: FAIL because the service does not exist.

- [ ] **Step 3: Implement the adapter with generic user-safe errors**

```ts
export async function sendEmailOtp(client: AuthClient, email: string): Promise<void> {
  const validation = validateEmail(email);
  if (validation) throw new AuthInputError(validation);
  const { error } = await client.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });
  if (error) throw new AuthRequestError('验证码发送失败，请稍后重试');
}

export async function verifyEmailOtp(client: AuthClient, email: string, token: string): Promise<void> {
  const validation = validateOtp(token);
  if (validation) throw new AuthInputError(validation);
  const { error } = await client.auth.verifyOtp({
    email: email.trim().toLowerCase(), token, type: 'email',
  });
  if (error) throw new AuthRequestError('验证码错误或已过期');
}
```

Do not expose raw Supabase error text that distinguishes registered from unregistered accounts.

- [ ] **Step 4: Run focused tests**

Run: `npx tsx --test src/auth/authService.test.ts`

Expected: email, OTP, send, verify, and sign-out tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/auth/authService.ts src/auth/authService.test.ts
git commit -m "feat: add email OTP auth service"
```

---

### Task 4: Login UI and Auth Gate

**Files:**
- Create: `src/auth/authState.ts`
- Create: `src/auth/authState.test.ts`
- Create: `src/auth/AuthProvider.tsx`
- Create: `src/components/auth/LoginPage.tsx`
- Create: `src/components/auth/LoginPage.test.ts`
- Create: `src/components/auth/AuthGate.tsx`
- Modify: `src/main.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: `AuthState = { status: 'loading'|'unauthenticated'|'authenticated'; user: User|null }`
- Produces: `useAuth(): { state; sendCode; verifyCode; signOut }`
- Produces: `chooseEntryScreen(authStatus, onboardingCompleted): 'loading'|'login'|'onboarding'|'product'`
- Consumes: Task 3 auth functions and `supabase.auth.onAuthStateChange`

- [ ] **Step 1: Write failing state and markup tests**

```ts
test('never renders product content while auth is loading or missing', () => {
  assert.equal(chooseEntryScreen('loading', false), 'loading');
  assert.equal(chooseEntryScreen('unauthenticated', false), 'login');
  assert.equal(chooseEntryScreen('authenticated', false), 'onboarding');
  assert.equal(chooseEntryScreen('authenticated', true), 'product');
});
```

Render `LoginPage` with `renderToStaticMarkup` and assert it contains a labelled email field, one primary submit button, status text with `aria-live`, and no password input.

- [ ] **Step 2: Run focused tests and verify red**

Run: `npx tsx --test src/auth/authState.test.ts src/components/auth/LoginPage.test.ts`

Expected: FAIL because the files do not exist.

- [ ] **Step 3: Implement provider, reducer, and two-stage login**

`AuthProvider` must call `getSession()` once, subscribe to `onAuthStateChange`, clear user-specific memory before setting `unauthenticated`, and unsubscribe on unmount.

`LoginPage` states are exactly:

```ts
type LoginStep =
  | { name: 'email'; email: string; error: string }
  | { name: 'code'; email: string; token: string; error: string; resendAt: number }
  | { name: 'submitting'; email: string; token: string; action: 'send'|'verify' };
```

After send success, enter `code` with `resendAt = Date.now() + 60_000`. Keep the email on every failure. The code input must use `inputMode="numeric"`, `autoComplete="one-time-code"`, `maxLength={6}`, and an accessible label.

Wrap the application in `AuthProvider` from `src/main.tsx`. `AuthGate` renders only one of: full-page loader, `LoginPage`, onboarding, or the authenticated product.

- [ ] **Step 4: Verify auth UI and project checks**

Run: `npx tsx --test src/auth/authState.test.ts src/components/auth/LoginPage.test.ts`

Expected: all focused tests pass.

Run: `npm run lint`

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/auth src/components/auth src/main.tsx src/index.css
git commit -m "feat: add OTP login and auth gate"
```

---

### Task 5: Domain Mappers and Repository Contract

**Files:**
- Create: `src/data/database.types.ts`
- Create: `src/data/mappers.ts`
- Create: `src/data/mappers.test.ts`
- Create: `src/data/appRepository.ts`
- Create: `src/data/supabaseAppRepository.ts`
- Create: `src/data/supabaseAppRepository.test.ts`
- Modify: `src/types.ts`

**Interfaces:**
- Produces: `AppSnapshot`
- Produces: `AppRepository`
- Produces: `createSupabaseAppRepository(client, userId): AppRepository`
- Consumes: existing `WorkSchedule`, `NonWorkGoal`, `CheckupNode`, `WeeklyFocusTask`, `TodayTask`, `EnergyCheckin`, `DailySummary`

Before defining mappers, extend `WeeklyFocusTask` with required `goalId: string` and `title: string`, and extend `TodayTask` with optional `weeklyTaskId?: string`. These IDs preserve database relationships without matching records by display text.

- [ ] **Step 1: Write failing mapper and error tests**

```ts
test('maps database minutes and time tags to the existing domain model', () => {
  assert.deepEqual(goalRowToDomain({
    id: 'g1', category: 'exercise', title: '每周散步', weekly_minutes: 90,
    target_date: '2026-09-30', status: 'active',
  }), {
    id: 'g1', category: 'exercise', title: '每周散步', weeklyHours: 1.5,
    targetDate: '2026-09-30',
  });
  assert.equal(timeTagRowToDomain('afternoon'), '下午');
  assert.equal(timeTagDomainToRow('晚上'), 'evening');
});
```

Test that every Supabase `{ error }` becomes `RepositoryError('数据暂时无法读取，请重试')` or `RepositoryError('数据尚未保存，请重试')` and never returns success.

- [ ] **Step 2: Run focused repository tests and verify red**

Run: `npx tsx --test src/data/mappers.test.ts src/data/supabaseAppRepository.test.ts`

Expected: FAIL because repository files do not exist.

- [ ] **Step 3: Define the exact repository contract**

```ts
export interface AppSnapshot {
  profile: PregnancyProfile | null;
  workSchedule: WorkSchedule | null;
  goals: NonWorkGoal[];
  checkups: CheckupNode[];
  weeklyFocusTasks: WeeklyFocusTask[];
  todayTasks: TodayTask[];
  energyCheckins: EnergyCheckin[];
  summary: DailySummary | null;
  onboardingCompleted: boolean;
}

export interface AppRepository {
  loadSnapshot(localDate: string, weekStart: string): Promise<AppSnapshot>;
  saveProfile(profile: PregnancyProfile, workSchedule: WorkSchedule): Promise<void>;
  replaceGoals(goals: NonWorkGoal[]): Promise<void>;
  replaceCheckups(checkups: CheckupNode[]): Promise<void>;
  completeOnboarding(): Promise<void>;
  replaceWeeklyPlan(weekStart: string, availableMinutes: number, tasks: WeeklyFocusTask[]): Promise<void>;
  saveEnergyCheckin(localDate: string, checkin: EnergyCheckin): Promise<void>;
  replaceDailyTasks(localDate: string, tasks: TodayTask[]): Promise<void>;
  updateDailyTask(task: TodayTask): Promise<void>;
  saveDailySummary(localDate: string, summary: DailySummary): Promise<void>;
}
```

- [ ] **Step 4: Implement Supabase table calls and verify**

`loadSnapshot` reads profile, active goals, future checkups, current weekly plan/tasks, today's energy/tasks, and today's summary with `Promise.all`. Every query includes the signed-in user's `user_id`; RLS remains the authority.

Replacement methods use `upsert` for current records and archive/cancel removed records rather than deleting history. `saveEnergyCheckin` inserts `sequence = checkin.checkinCount`; a unique-constraint error maps to `今天只能确认两次状态`.

Run: `npx tsx --test src/data/mappers.test.ts src/data/supabaseAppRepository.test.ts`

Expected: mapper and success/error query contract tests pass.

Run: `npm run lint`

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/data/database.types.ts src/data/mappers.ts src/data/mappers.test.ts src/data/appRepository.ts src/data/supabaseAppRepository.ts src/data/supabaseAppRepository.test.ts
git commit -m "feat: add user data repository"
```

---

### Task 6: App Data Loader and Explicit Empty/Failure States

**Files:**
- Create: `src/data/useAppData.ts`
- Modify: `src/App.tsx`
- Modify: `src/preview/PreviewGate.tsx`
- Test: `src/data/useAppData.test.ts`
- Test: `src/preview/PreviewGate.test.ts`

**Interfaces:**
- Produces: `AppDataState = { status: 'loading'|'ready'|'failure'; snapshot; error }`
- Produces: `reload(): Promise<void>` and typed mutation methods mirroring `AppRepository`
- Consumes: authenticated user ID, local date, week start, and Task 5 repository

- [ ] **Step 1: Write failing state-transition tests**

Test these exact transitions with a fake repository:

```text
initial -> loading -> ready(snapshot)
initial -> loading -> failure(message)
failure -> reload -> ready(snapshot)
mutation failure -> ready(snapshot) plus unsavedError, without replacing snapshot with mock data
```

- [ ] **Step 2: Run focused tests and verify red**

Run: `npx tsx --test src/data/useAppData.test.ts`

Expected: FAIL because the hook/state module does not exist.

- [ ] **Step 3: Implement authenticated bootstrap**

Refactor `ProductApp` to receive `snapshot` and repository-backed callbacks. Remove imports of `INITIAL_*` from production `App.tsx`. Keep mock data reachable only inside `PreviewGate` when its existing explicit preview query is present and when `import.meta.env.DEV` is true.

Loading displays a full application loader. Failure displays the PRD failure state with one “重新加载” button. An empty snapshot renders real onboarding/empty states.

- [ ] **Step 4: Run focused and regression tests**

Run: `npx tsx --test src/data/useAppData.test.ts src/preview/PreviewGate.test.ts`

Expected: all focused tests pass.

Run: `npm test`

Expected: all existing and new tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/data/useAppData.ts src/data/useAppData.test.ts src/preview/PreviewGate.tsx src/preview/PreviewGate.test.ts
git commit -m "feat: load authenticated app data"
```

---

### Task 7: Empty First-Login Onboarding

**Files:**
- Create: `src/onboarding/onboardingState.ts`
- Create: `src/onboarding/onboardingState.test.ts`
- Create: `src/components/onboarding/OnboardingProfilePage.tsx`
- Create: `src/components/onboarding/OnboardingProfilePage.test.ts`
- Modify: `src/components/auth/AuthGate.tsx`
- Modify: `src/home/profile.ts`
- Modify: `src/home/profile.test.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `canCompleteOnboarding(profile, workSchedule, goals): boolean`
- Produces: `OnboardingProfilePage` with async `onSave(profile, workSchedule)`
- Consumes: `snapshot.onboardingCompleted` and repository profile/goal mutations

- [ ] **Step 1: Write failing onboarding rules**

```ts
test('requires profile, work hours, and at least one non-work goal', () => {
  assert.equal(canCompleteOnboarding(null, null, []), false);
  assert.equal(canCompleteOnboarding(profile, schedule, []), false);
  assert.equal(canCompleteOnboarding(profile, schedule, [goal]), true);
});
```

Update profile tests so `createDefaultProfile` is no longer used for a signed-in production user. Keep pregnancy calculation and validation tests pure.

- [ ] **Step 2: Run focused tests and verify red**

Run: `npx tsx --test src/onboarding/onboardingState.test.ts src/home/profile.test.ts src/components/onboarding/OnboardingProfilePage.test.ts`

Expected: onboarding files are missing or old local-storage expectations fail.

- [ ] **Step 3: Implement the two-part onboarding path**

Part 1 collects display name, due date, work days, work start, and work end. On successful cloud save, open the existing Page 1 goal flow with empty arrays.

Part 2 requires at least one of `side_hustle`, `exercise`, or `pregnancy` with title, weekly time, and deadline. Page 1 confirmation saves goals/checkups and calls `completeOnboarding()` only after all saves succeed.

Do not create default goals, tasks, checkups, or summaries.

- [ ] **Step 4: Verify focused tests and type check**

Run: `npx tsx --test src/onboarding/onboardingState.test.ts src/home/profile.test.ts src/components/onboarding/OnboardingProfilePage.test.ts`

Expected: all focused tests pass.

Run: `npm run lint`

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/onboarding src/components/onboarding src/components/auth/AuthGate.tsx src/home/profile.ts src/home/profile.test.ts src/App.tsx
git commit -m "feat: add empty first-login onboarding"
```

---

### Task 8: Persist Profile, Goals, Checkups, and Weekly Plan

**Files:**
- Modify: `src/components/home/TodayHomePage.tsx`
- Modify: `src/components/home/ProfileEditor.tsx`
- Modify: `src/components/home/ProfileEditor.test.ts`
- Modify: `src/components/pages/Page1GoalPanorama.tsx`
- Modify: `src/components/pages/Page2WeeklyFocus.tsx`
- Modify: `src/App.tsx`
- Test: `src/data/persistence-flow.test.ts`

**Interfaces:**
- `TodayHomePage` consumes `profile`, `onSaveProfile`, and `onSignOut`; it no longer reads `window.localStorage`.
- `ProfileEditor.onSave(profile)` returns `Promise<void>`.
- Page 1 confirmation awaits profile/work, goals, and checkups before navigation.
- Page 2 confirmation awaits `replaceWeeklyPlan` before navigation.

- [ ] **Step 1: Write failing persistence-flow tests**

Use a recording fake `AppRepository` and assert:

```text
profile save calls saveProfile once and does not call localStorage
Page 1 failure keeps the user on Page 1 and displays “尚未保存”
Page 2 success calls replaceWeeklyPlan before currentStep becomes 3
checkup payload preserves its original occurs_at and fixed status
```

- [ ] **Step 2: Run focused tests and verify red**

Run: `npx tsx --test src/data/persistence-flow.test.ts src/components/home/ProfileEditor.test.ts`

Expected: FAIL because callbacks are synchronous/local.

- [ ] **Step 3: Convert mutations to awaited repository operations**

Every mutation follows this state machine:

```ts
setSaveState({ name: 'saving' });
try {
  await mutation(payload);
  setSaveState({ name: 'saved' });
  navigateAfterSave();
} catch (error) {
  setSaveState({ name: 'failure', message: toUserMessage(error) });
}
```

Keep drafts in component state on failure. Add “退出登录” inside the profile dialog; it calls `onSignOut` only after an explicit confirmation.

- [ ] **Step 4: Run tests**

Run: `npx tsx --test src/data/persistence-flow.test.ts src/components/home/ProfileEditor.test.ts`

Expected: all focused tests pass.

Run: `npm test`

Expected: full suite passes.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/home/TodayHomePage.tsx src/components/home/ProfileEditor.tsx src/components/home/ProfileEditor.test.ts src/components/pages/Page1GoalPanorama.tsx src/components/pages/Page2WeeklyFocus.tsx src/data/persistence-flow.test.ts
git commit -m "feat: persist profile goals and weekly plan"
```

---

### Task 9: Persist Energy, Daily Tasks, Actions, and Summary

**Files:**
- Modify: `src/components/home/TodayHomePage.tsx`
- Modify: `src/components/pages/Page3TodayStatusTasks.tsx`
- Modify: `src/components/pages/Page4ActionExecution.tsx`
- Modify: `src/components/pages/Page5SummaryTomorrow.tsx`
- Modify: `src/App.tsx`
- Test: `src/data/daily-cycle.test.ts`

**Interfaces:**
- First and second energy confirmation call `saveEnergyCheckin(localDate, checkin)` with sequence 1 or 2.
- Task replacement calls `replaceDailyTasks`; single status changes call `updateDailyTask`.
- Summary confirmation calls `saveDailySummary` before completion feedback.

- [ ] **Step 1: Write failing daily-cycle tests**

Test the exact business rules:

```text
first energy check-in writes sequence 1
second energy check-in writes sequence 2
third UI attempt does not call the repository
database duplicate/constraint failure displays “今天只能确认两次状态”
completing the current action persists completed status before promoting the next action
deferring a task persists adjustment_note
summary failure preserves the drafted tomorrow-first-step
```

- [ ] **Step 2: Run focused tests and verify red**

Run: `npx tsx --test src/data/daily-cycle.test.ts`

Expected: FAIL because daily actions update only React state.

- [ ] **Step 3: Await all daily mutations**

Remove the simulated 500 ms timer from cloud-backed energy adjustment. Show a real loading state while the repository call is pending. Do not update visible task order until the save succeeds. Keep checkups read-only in the rearrangement payload.

Daily summary derives factual counts and time from persisted daily tasks; `insight` remains empty until the second-round AI API exists. The user may enter or edit `tomorrowFirstStep` manually.

- [ ] **Step 4: Run focused and full tests**

Run: `npx tsx --test src/data/daily-cycle.test.ts`

Expected: all daily-cycle tests pass.

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/home/TodayHomePage.tsx src/components/pages/Page3TodayStatusTasks.tsx src/components/pages/Page4ActionExecution.tsx src/components/pages/Page5SummaryTomorrow.tsx src/data/daily-cycle.test.ts
git commit -m "feat: persist the daily task cycle"
```

---

### Task 10: Security, Double-Account, Deployment, and Documentation

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Test: all project tests

**Interfaces:**
- Consumes: completed Tasks 1–9
- Produces: production environment configuration and signed-off acceptance evidence

- [ ] **Step 1: Configure Supabase Auth safely**

In Supabase Authentication settings:

1. Enable email OTP.
2. Set Site URL to `https://growher.site`.
3. Add `http://127.0.0.1:3000` only as a development redirect.
4. Change the email template to show `{{ .Token }}` as a six-digit code, not `{{ .ConfirmationURL }}`.
5. Set OTP expiry to 10 minutes when the project setting permits it.
6. Keep user enumeration protection enabled.

- [ ] **Step 2: Run the complete local verification suite**

Run in order:

```bash
npm run test:design
npm run lint
npm test
npm run build
```

Expected: every command exits 0; build output contains no secret/service-role key strings.

Also run:

```bash
rg -n "service_role|sb_secret_|GEMINI_API_KEY|SUPABASE_SECRET" src dist .env.example
```

Expected: no matches.

- [ ] **Step 3: Configure Cloudflare public variables and deploy**

In the `growher` Cloudflare project build variables, create `VITE_SUPABASE_URL` with the exact Project URL copied from Supabase API settings, and create `VITE_SUPABASE_PUBLISHABLE_KEY` with the exact publishable key copied from the same settings.

Never add a Supabase secret key to public Vite variables. Push the reviewed branch to GitHub and allow Cloudflare to deploy the new commit.

- [ ] **Step 4: Execute production acceptance tests**

Use two separate email addresses and one phone plus one computer:

1. Account A receives a 6-digit code and starts empty.
2. Account A saves profile, one goal, one checkup, one weekly task, one energy check-in, and one daily task.
3. Account A logs in on the second device and sees the same records after reload.
4. Account B logs in and sees none of Account A's records.
5. Attempt a third energy check-in for Account A and verify rejection.
6. Log out Account A and verify no previous user data remains visible.
7. Temporarily disable network, submit a profile change, and verify “尚未保存”; restore network and retry successfully.
8. Verify the fixed checkup date remains unchanged after every task mutation.

- [ ] **Step 5: Update README and commit**

README must state: architecture, safe environment variable names, Supabase migration path, local commands, production deploy path, data boundary, and the fact that AI generation is not part of this release.

```bash
git add README.md .env.example
git commit -m "docs: document Supabase production setup"
```

- [ ] **Step 6: Final verification and release commit check**

Run:

```bash
git status -sb
git log --oneline -10
npm run test:design
npm run lint
npm test
npm run build
```

Expected: clean worktree, the ten task commits are present, and all four checks exit 0. Push the final branch, review the diff, merge to `main`, and verify `https://growher.site` once Cloudflare reports success.

---

## Requirement Coverage Check

| Confirmed requirement | Implemented by |
|---|---|
| Six-digit email OTP | Tasks 3–4, 10 |
| Session restore and logout | Tasks 4, 8 |
| Empty first-login data | Tasks 6–7 |
| Eight persisted data groups | Tasks 2, 5, 8–9 |
| Cross-device synchronization | Tasks 5–10 |
| User isolation and RLS | Tasks 2, 10 |
| Third energy check-in rejected | Tasks 2, 9, 10 |
| Fixed checkups unchanged | Tasks 2, 8–10 |
| No fallback to demo data | Tasks 6–7 |
| Save/loading/failure states | Tasks 4, 6–9 |
| No client secrets | Tasks 1–2, 10 |
| Existing flow and DESIGN.md preserved | Global constraints and Tasks 6–10 |
| AI API excluded from first release | Global constraints and Task 9 summary behavior |

## Execution Notes for the User

Only two moments require user action:

1. Log in to Supabase and approve creation of the project.
2. Use two email addresses during final isolation testing.

The user must never paste a database password, Supabase secret/service-role key, email password, or Cloudflare API token into chat. Browser-based login and secret fields are used when configuration is required.

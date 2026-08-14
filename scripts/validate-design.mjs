import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

function collectFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? collectFiles(path) : [path];
  });
}

const sourceFiles = collectFiles(join(root, 'src')).filter((file) => /\.(css|tsx|ts)$/.test(file));
const source = sourceFiles.map((file) => `\n/* ${relative(root, file)} */\n${readFileSync(file, 'utf8')}`).join('\n');
const css = readFileSync(join(root, 'src', 'index.css'), 'utf8');

const required = [
  ['390 px mobile baseline', css, /--app-width:\s*390px/],
  ['480 px shell maximum', css, /--app-max-width:\s*480px/],
  ['viewport-locked app shell', css, /\.app-shell\s*\{[\s\S]*?\n\s*height:\s*100vh/],
  ['56 px app bar', css, /--app-bar-height:\s*56px/],
  ['80 px action bar', css, /--action-bar-height:\s*80px/],
  ['primary ink token', css, /--color-primary:\s*#243247/i],
  ['paper background token', css, /--color-background:\s*#F7F4EE/i],
  ['orange accent token', css, /--color-accent:\s*#E87845/i],
  ['five stage progress', source, /currentStep\s*\/\s*totalSteps|\{currentStep\}\s*\/\s*\{totalSteps\}/],
  ['goal panorama stage', source, /目标设定与全景图/],
  ['weekly focus stage', source, /本周时间与重点确认/],
  ['today status stage', source, /今日状态与任务/],
  ['execution stage', source, /行动执行与重排/],
  ['summary stage', source, /今日总结与明日计划/],
  ['empty state', source, /empty/],
  ['loading state', source, /loading/],
  ['success state', source, /success/],
  ['failure state', source, /failure/],
  ['two energy checks', source, /第二次状态确认|第 2 次状态确认|二次状态确认/],
  ['fixed checkup rule', source, /固定日期|不可移动|不会移动/],
  ['vertical timeline', source, /whole-picture-timeline|vertical-timeline/],
];

const forbidden = [
  ['slate dark template colors', source, /\b(?:bg|text|border)-slate-(?:700|800|900|950)\b/],
  ['indigo template colors', source, /\b(?:bg|text|border|ring)-indigo-(?:300|400|500|600)\b/],
  ['website-style horizontal step pills', source, /Step Selector Pills Bar/],
  ['bottom tab navigation', source, /bottom-tab|Bottom Tab/i],
];

const failures = [];

for (const [label, haystack, pattern] of required) {
  if (!pattern.test(haystack)) failures.push(`Missing: ${label}`);
}

for (const [label, haystack, pattern] of forbidden) {
  if (pattern.test(haystack)) failures.push(`Forbidden: ${label}`);
}

if (failures.length) {
  console.error('DESIGN CONTRACT FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`DESIGN CONTRACT PASSED (${required.length} required rules, ${forbidden.length} forbidden-pattern checks)`);

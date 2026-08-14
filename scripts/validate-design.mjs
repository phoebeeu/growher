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
  ['Inter font family', css, /font-family:\s*Inter\b/i],
  ['legacy canvas color', css, /#F7F4EE/i],
  ['legacy orange color', css, /#E87845/i],
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

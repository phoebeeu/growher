import { SVGProps } from 'react';

type PatternProps = SVGProps<SVGSVGElement>;

const shared = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function BellyProfilePattern(props: PatternProps) {
  return <svg {...shared} {...props}><path d="M9 3.5c2.2 1.4 3 3.1 2.7 5.2 3.8.7 6.1 3.1 6.1 6.4 0 3.6-3 5.4-7.2 5.4H6.8" /><path d="M7.7 7.2c-1.4 3.5-1.1 8.7.8 13.3" /><path d="M11.7 8.7c-1.4 1-2.2 2.4-2.2 4.1" /></svg>;
}

export function WeekRingPattern({ children, ...props }: PatternProps) {
  return <svg {...shared} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 8.6 6.4" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />{children}</svg>;
}

export function TaskSignalPattern(props: PatternProps) {
  return <svg {...shared} {...props}><path d="M3 12h4l2-5 4 10 2-5h6" /><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="20" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
}

export function CheckupCalendarPattern(props: PatternProps) {
  return <svg {...shared} {...props}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4M17 3v4M3 10h18" /><path d="m8 15 2.2 2.2L16 13" /></svg>;
}

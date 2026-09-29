import { describe, expect, it } from 'vitest';
import { cn, dateRange, formatDate, readingTime } from './utils';

const JAN_RE = /Jan/;
const YEAR_2024_RE = /2024/;

describe('cn', () => {
  it('merges conflicting tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('formatDate', () => {
  it('formats a date in en-US short month style', () => {
    const formatted = formatDate(new Date(Date.UTC(2024, 0, 5)));
    expect(formatted).toMatch(JAN_RE);
    expect(formatted).toMatch(YEAR_2024_RE);
  });
});

describe('readingTime', () => {
  it('strips html tags before counting words', () => {
    expect(readingTime('<p>one two three four</p>')).toBe('1 min read');
  });

  it('scales with longer plain text', () => {
    const words = Array.from({ length: 400 }).fill('word').join(' ');
    expect(readingTime(words)).toBe('3 min read');
  });
});

describe('dateRange', () => {
  it('formats a closed date range with month and year', () => {
    const start = new Date(2020, 0, 1);
    const end = new Date(2021, 5, 1);
    expect(dateRange(start, end)).toBe(
      `${start.toLocaleString('default', { month: 'short' })}2020 - ${end.toLocaleString('default', { month: 'short' })}2021`,
    );
  });

  it('uses a string end date as the year label without a month', () => {
    const start = new Date(2019, 2, 1);
    expect(dateRange(start, 'Present')).toBe(
      `${start.toLocaleString('default', { month: 'short' })}2019 - Present`,
    );
  });
});

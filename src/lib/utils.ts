import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const HTML_TAG_RE = /<[^>]+>/g;
const WHITESPACE_RE = /\s+/;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html.replace(HTML_TAG_RE, '');
  const wordCount = textOnly.split(WHITESPACE_RE).length;
  const readingTimeMinutes = (wordCount / 200 + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

export function dateRange(startDate: Date, endDate?: Date | string): string {
  const startMonth = startDate.toLocaleString('default', { month: 'short' });
  const startYear = startDate.getFullYear().toString();
  let endMonth;
  let endYear;

  if (endDate) {
    if (typeof endDate === 'string') {
      endMonth = '';
      endYear = endDate;
    }
    else {
      endMonth = endDate.toLocaleString('default', { month: 'short' });
      endYear = endDate.getFullYear().toString();
    }
  }

  return `${startMonth}${startYear} - ${endMonth}${endYear}`;
}

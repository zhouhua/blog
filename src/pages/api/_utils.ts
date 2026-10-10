import { hash } from 'ohash';

export function base62(num: number): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const list: number[] = [];
  let remainder = num;
  while (remainder > 0) {
    list.unshift(remainder % 62);
    remainder = Math.floor(remainder / 62);
  }
  return list.map(i => chars[i]).join('');
}

/** Only http(s) — blocks javascript:, data:, etc. used as short-link targets. */
export function isAllowedRedirectUrl(value: string): boolean {
  if (!URL.canParse(value)) {
    return false;
  }
  const { protocol } = new URL(value);
  return protocol === 'http:' || protocol === 'https:';
}

export function createLinkKey(value: string): string {
  let num = 0;
  for (const char of hash(value)) {
    num = (num * 33 + char.charCodeAt(0)) >>> 0;
  }
  return base62(num || 1);
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code: string }).code === '23505'
  );
}

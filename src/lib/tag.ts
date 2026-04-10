export const TAG_SLUG_RE = /\s+|\//g;

export function toTagSlug(value: string): string {
  return value.replace(TAG_SLUG_RE, '-').toLowerCase();
}

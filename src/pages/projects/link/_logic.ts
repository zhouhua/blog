export function buildShortUrl(origin: string, key: string): string {
  return `${origin}/i/${key}`;
}

export function isApiSuccess(code: unknown): boolean {
  return code === 0;
}

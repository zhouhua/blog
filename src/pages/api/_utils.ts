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

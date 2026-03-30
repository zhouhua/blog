import { describe, expect, it } from 'vitest';
import { getBackgroundValueUpdate } from './_logic';

describe('getBackgroundValueUpdate', () => {
  it('does not request an update when type1 background already matches the primary color', () => {
    expect(getBackgroundValueUpdate('#112233', 'type1', '#112233')).toBeNull();
  });

  it('syncs type1 background to the primary color when it drifts', () => {
    expect(getBackgroundValueUpdate('#ffffff', 'type1', '#112233')).toBe('#112233');
  });

  it('does not request an update when type2 background is already the fixed white canvas', () => {
    expect(getBackgroundValueUpdate('#ffffffff', 'type2', '#112233')).toBeNull();
  });

  it('syncs type2 background back to the fixed white canvas when needed', () => {
    expect(getBackgroundValueUpdate('#112233', 'type2', '#445566')).toBe('#ffffffff');
  });
});

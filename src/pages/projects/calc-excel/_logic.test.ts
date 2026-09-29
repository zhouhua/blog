import { describe, expect, it } from 'vitest';
import { findRowExceedingThreshold } from './_logic';

describe('findRowExceedingThreshold', () => {
  const columns = ['name', 'amount'];
  const sheetData = [
    ['name', 'amount'],
    ['a', '10'],
    ['b', '20'],
    ['c', '5'],
  ];

  it('returns missing-column when no column is selected', () => {
    expect(findRowExceedingThreshold({
      columns,
      selectedColumn: '',
      sheetData,
      threshold: '15',
    })).toEqual({ ok: false, reason: 'missing-column' });
  });

  it('returns invalid-threshold when the threshold is not a number', () => {
    expect(findRowExceedingThreshold({
      columns,
      selectedColumn: 'amount',
      sheetData,
      threshold: 'x',
    })).toEqual({ ok: false, reason: 'invalid-threshold' });
  });

  it('returns column-not-found when the selected column is absent', () => {
    expect(findRowExceedingThreshold({
      columns,
      selectedColumn: 'missing',
      sheetData,
      threshold: '15',
    })).toEqual({ ok: false, reason: 'column-not-found' });
  });

  it('returns the first row where the running sum exceeds the threshold', () => {
    expect(findRowExceedingThreshold({
      columns,
      selectedColumn: 'amount',
      sheetData,
      threshold: '25',
    })).toEqual({
      cumulativeSum: 30,
      ok: true,
      rowData: { amount: '20', name: 'b' },
      rowNumber: 3,
    });
  });

  it('returns not-exceeded with the final cumulative sum when nothing passes', () => {
    expect(findRowExceedingThreshold({
      columns,
      selectedColumn: 'amount',
      sheetData,
      threshold: '100',
    })).toEqual({
      cumulativeSum: 35,
      ok: false,
      reason: 'not-exceeded',
    });
  });
});

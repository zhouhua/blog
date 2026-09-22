import type { UseGroup, UseItem } from './index';
import { describe, expect, it } from 'vitest';
import { prepareUseGroups } from './prepare';

function item(name: string): UseItem {
  return { name, note: `${name} note` };
}

describe('prepareUseGroups', () => {
  it('drops empty groups, drops empty subgroups, keeps every remaining item, and renumbers', () => {
    const groups: UseGroup[] = [
      { description: 'nothing', id: 'empty', items: [], title: '空' },
      {
        description: 'direct items',
        id: 'a',
        items: [item('one'), item('two')],
        title: 'A',
      },
      {
        description: 'only subgroups',
        id: 'b',
        items: [],
        subgroups: [
          { id: 'b-empty', items: [], title: '空子类' },
          { id: 'b-x', items: [item('three')], title: 'X' },
        ],
        title: 'B',
      },
    ];

    const result = prepareUseGroups(groups);

    expect(result.map(group => group.id)).toEqual(['a', 'b']);
    expect(result.map(group => group.indexLabel)).toEqual(['01', '02']);
    expect(result[0]?.items.map(entry => entry.name)).toEqual(['one', 'two']);
    expect(result[1]?.subgroups.map(subgroup => subgroup.id)).toEqual(['b-x']);
  });
});

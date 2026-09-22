import type { UseGroup, UseSubgroup } from './index';

export interface PreparedUseGroup extends Omit<UseGroup, 'subgroups'> {
  indexLabel: string;
  subgroups: UseSubgroup[];
}

export function prepareUseGroups(groups: UseGroup[]): PreparedUseGroup[] {
  return groups
    .map(group => ({
      ...group,
      subgroups: (group.subgroups ?? []).filter(subgroup => subgroup.items.length > 0),
    }))
    .filter(group => group.items.length > 0 || group.subgroups.length > 0)
    .map((group, index) => ({
      ...group,
      indexLabel: String(index + 1).padStart(2, '0'),
    }));
}

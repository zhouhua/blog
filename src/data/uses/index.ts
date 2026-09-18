import trellisLogo from '../../assets/image/trellis.png';

export interface UseItem {
  /** 用户怎么称呼它 */
  name: string;
  /** 用户说出的理由或用法。没说就不要写。 */
  note?: string;
  /** 官网、仓库或站内链接。以 http 开头的会在新标签打开。 */
  href?: string;
  /** 官方 logo。没有就省略。 */
  logo?: string;
}

export interface UseGroup {
  id: string;
  title: string;
  description: string;
  items: UseItem[];
  /** 一层子分类。大多数分组不要填。规则见同目录 AGENTS.md。 */
  subgroups?: UseSubgroup[];
}

export interface UseSubgroup {
  id: string;
  title: string;
  description?: string;
  items: UseItem[];
}

/**
 * 不要在这里预先写分类、子分类或示例。
 * 添加内容前先读同目录的 AGENTS.md。
 */
export const USES_GROUPS: UseGroup[] = [
  {
    description: '方法论',
    id: 'skills',
    items: [
      {
        href: '/2026/trellis',
        logo: trellisLogo.src,
        name: 'trellis',
        note: '给 coding agent 用的脚手架。写代码前，按这一次任务读取仓库里的规范。',
      },
    ],
    title: 'Skill',
  },
];

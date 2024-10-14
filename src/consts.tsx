import type { Menu, Metadata, Site, Socials } from '@types';

export const SITE: Site = {
  EMAIL: 'zhou--hua@163.com',
  NAME: '周骅的博客',
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
};

export const HOME: Metadata = {
  DESCRIPTION: '有趣的灵魂终会相遇',
  TITLE: '首页',
};

export const BLOG: Metadata = {
  DESCRIPTION: '胡言乱语',
  TITLE: '文章',
};

export const JOURNALS: Metadata = {
  DESCRIPTION: '随手记录不成熟的想法',
  TITLE: '随笔',
};

export const PROJECTS: Metadata = {
  DESCRIPTION: '自娱自乐的空间',
  TITLE: '项目',
};

export const PHOTOES: Metadata = {
  DESCRIPTION: '分享风景、故事与回忆',
  TITLE: '照片',
};

export const menu: Menu[] = [
  {
    icon: 'fa6-solid:pen-fancy',
    iconComponent: <span className="iconify fa6-solid--pen-fancy" />,
    name: '文章',
    path: '/articles',
  },
  {
    icon: 'fa6-solid:code',
    iconComponent: <span className="iconify fa6-solid--code" />,
    name: '项目',
    path: '/projects',
  },
  {
    icon: 'fa6-solid:message',
    iconComponent: <span className="iconify fa6-solid--message" />,
    name: '随笔',
    path: '/journals',
  },
  {
    icon: 'fa6-solid:image',
    iconComponent: <span className="iconify fa6-solid--image" />,
    name: '照片',
    path: '/photos',
  },
  {
    icon: 'fa6-solid:address-card',
    iconComponent: <span className="iconify fa6-solid--address-card" />,
    name: '关于我',
    path: '/about',
  },
];

export const SOCIALS: Socials = [
  {
    HREF: 'https://twitter.com/markhorn_dev',
    NAME: 'twitter-x',
  },
  {
    HREF: 'https://github.com/markhorn-dev',
    NAME: 'github',
  },
  {
    HREF: 'https://www.linkedin.com/in/markhorn-dev',
    NAME: 'linkedin',
  },
];

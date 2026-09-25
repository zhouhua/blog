import archifyLogo from '../../assets/image/archify-logo.png';
import cascadiaCodeLogo from '../../assets/image/cascadia-code-logo.png';
import chromeLogo from '../../assets/image/chrome-logo.png';
import cursorLogo from '../../assets/image/cursor-logo.png';
import firaCodeLogo from '../../assets/image/fira-code-gh-logo.png';
import grillMeLogo from '../../assets/image/grill-me.png';
import hallmarkLogo from '../../assets/image/hallmark-logo.png';
import impeccableLogo from '../../assets/image/impeccable-logo.png';
import iterm2Logo from '../../assets/image/iterm2.png';
import lucideLogo from '../../assets/image/lucide-logo.png';
import lxgwZhenkaiLogo from '../../assets/image/lxgw-zhenkai-logo.png';
import mosLogo from '../../assets/image/mos.png';
import ohMyZshLogo from '../../assets/image/oh-my-zsh-logo.png';
import openpanelLogo from '../../assets/image/openpanel-logo.png';
import phosphoriconsLogo from '../../assets/image/phosphoricons-logo.png';
import raycastLogo from '../../assets/image/raycast.png';
import reiconLogo from '../../assets/image/reicon-logo.png';
import superpowersLogo from '../../assets/image/superpowers.png';
import trellisLogo from '../../assets/image/trellis.png';
import typelessLogo from '../../assets/image/typeless-logo.png';
import uiUxProMaxLogo from '../../assets/image/ui-ux-pro-max-logo.png';

export interface UseItem {
  /** 用户怎么称呼它 */
  name: string;
  /** 必填。一两句：它是什么，具体做什么。 */
  note: string;
  /** 官网、仓库或站内链接。以 http 开头的会在新标签打开。 */
  href?: string;
  /** 官方 logo。没有则用它所在处的图标加名称。 */
  logo?: string;
  /** 只有像素图打开。 */
  pixelated?: boolean;
  /** 深色单色标才反色。自带底色的彩色图不要开。 */
  invert?: boolean;
}

export interface UseGroup {
  id: string;
  title: string;
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
    id: 'skills',
    items: [],
    subgroups: [
      {
        id: 'skills-method',
        items: [
          {
            href: '/2026/trellis',
            logo: trellisLogo.src,
            name: 'trellis',
            note: '给 coding agent 用的脚手架。写代码前，按这一次任务读取仓库里的规范。',
            pixelated: true,
          },
          {
            href: '/2026/superpowers',
            invert: true,
            logo: superpowersLogo.src,
            name: 'superpowers',
            note: '装在 coding agent 上的一套开发方法。先确认规格，再按测试驱动实现。',
          },
          {
            href: '/2026/grill-me',
            logo: grillMeLogo.src,
            name: 'grill-me',
            note: '从一个还没成形的想法问起，直到问清楚。不写文件。',
          },
        ],
        title: '方法论',
      },
      {
        id: 'skills-design',
        items: [
          {
            href: '/2026/ui-ux-pro-max',
            logo: uiUxProMaxLogo.src,
            name: 'ui-ux-pro-max',
            note: '可检索的设计资料库。收录风格、配色、字体、图表和交互规则。',
          },
          {
            href: '/2026/hallmark',
            invert: true,
            logo: hallmarkLogo.src,
            name: 'hallmark',
            note: '给 coding agent 用的设计 skill。把字体、颜色、布局、动效和交互收成一套规则。',
          },
          {
            href: '/2026/impeccable',
            invert: true,
            logo: impeccableLogo.src,
            name: 'impeccable',
            note: '给 agent 用的设计词汇。用来从零做界面、改已有界面，并守住已有的设计系统。',
          },
        ],
        title: '设计',
      },
      {
        id: 'skills-diagram',
        items: [
          {
            href: '/2026/archify',
            logo: archifyLogo.src,
            name: 'archify',
            note: '写给 coding agent 的 skill。把系统描述画成可交互的技术图。',
          },
        ],
        title: '图表',
      },
    ],
    title: 'Skill',
  },
  {
    id: 'mac-apps',
    items: [
      {
        href: 'https://www.raycast.com',
        logo: raycastLogo.src,
        name: 'raycast',
        note: 'Spotlight 的替代品。支持大量插件，AI 功能也很强。',
      },
      {
        href: 'https://mos.caldis.me/',
        logo: mosLogo.src,
        name: 'mos',
        note: '支持修改鼠标滚轮方向。也可以让滚动变顺。',
      },
      {
        href: 'https://iterm2.com/',
        logo: iterm2Logo.src,
        name: 'iterm2',
        note: '替代系统「终端」的终端模拟器。',
      },
      {
        href: 'https://cursor.com/',
        invert: true,
        logo: cursorLogo.src,
        name: 'cursor',
        note: '编程用的 agent。把想法交给它，由它做成软件。',
      },
      {
        href: 'https://www.typeless.com/',
        logo: typelessLogo.src,
        name: 'typeless',
        note: 'AI 语音听写。自然说话，把话整理成消息、邮件和文档，读起来像亲手打出来的。',
      },
      {
        href: 'https://www.google.com/chrome/',
        logo: chromeLogo.src,
        name: 'chrome',
        note: '网页浏览器。用来浏览网页。',
      },
    ],
    title: 'Mac 软件',
  },
  {
    id: 'open-source',
    items: [
      {
        href: 'https://openpanel.dev/',
        logo: openpanelLogo.src,
        name: 'openpanel',
        note: '开源的网站与产品分析。用来跟踪访问与事件，也可以自己部署。',
      },
      {
        href: 'https://ohmyz.sh/',
        logo: ohMyZshLogo.src,
        name: 'oh-my-zsh',
        note: '开源的 Zsh 配置框架。用来管理 Zsh 配置，自带插件和主题。',
        pixelated: true,
      },
    ],
    title: '开源软件',
  },
  {
    id: 'fonts',
    items: [
      {
        href: 'https://github.com/tonsky/FiraCode',
        invert: true,
        logo: firaCodeLogo.src,
        name: 'fira-code',
        note: '免费等宽字体，带编程连字。用来写代码。',
      },
      {
        href: 'https://github.com/microsoft/cascadia-code',
        logo: cascadiaCodeLogo.src,
        name: 'cascadia-code',
        note: '等宽字体，带编程连字。给 Windows Terminal 用。',
      },
      {
        href: 'https://github.com/lxgw/LxgwZhenKai',
        invert: true,
        logo: lxgwZhenkaiLogo.src,
        name: '霞鹜臻楷',
        note: '开源中文字体。基于霞鹜文楷加粗而来，后期用 AI 辅助补字。',
      },
    ],
    title: '字体',
  },
  {
    id: 'design',
    items: [],
    subgroups: [
      {
        id: 'design-icons',
        items: [
          {
            href: 'https://reicon.dev/',
            logo: reiconLogo.src,
            name: 'reicon',
            note: '开源 SVG 图标库。',
          },
          {
            href: 'https://phosphoricons.com/',
            logo: phosphoriconsLogo.src,
            name: 'phosphoricons',
            note: '开源图标库。',
          },
          {
            href: 'https://lucide.dev/',
            logo: lucideLogo.src,
            name: 'lucide',
            note: '开源图标库。',
          },
        ],
        title: '图标库',
      },
    ],
    title: '设计',
  },
];

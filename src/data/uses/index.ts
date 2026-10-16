import archifyLogo from '../../assets/image/archify-logo.png';
import cascadiaCodeLogo from '../../assets/image/cascadia-code-logo.png';
import chromeLogo from '../../assets/image/chrome-logo.png';
import claudeCodeLogo from '../../assets/image/claude-code-logo.png';
import codexLogo from '../../assets/image/codex-logo.png';
import cursorLogo from '../../assets/image/cursor-logo.png';
import diagramDesignLogo from '../../assets/image/diagram-design-logo.png';
import firaCodeLogo from '../../assets/image/fira-code-gh-logo.png';
import grillWithDocsLogo from '../../assets/image/grill-with-docs.png';
import hallmarkLogo from '../../assets/image/hallmark-logo.png';
import impeccableLogo from '../../assets/image/impeccable-logo.png';
import iterm2Logo from '../../assets/image/iterm2.png';
import lucideLogo from '../../assets/image/lucide-logo.png';
import lxgwZhenkaiLogo from '../../assets/image/lxgw-zhenkai-logo.png';
import mosLogo from '../../assets/image/mos.png';
import ohMyZshLogo from '../../assets/image/oh-my-zsh-logo.png';
import opencodeLogo from '../../assets/image/opencode-logo.png';
import openpanelLogo from '../../assets/image/openpanel-logo.png';
import phosphoriconsLogo from '../../assets/image/phosphoricons-logo.png';
import ponytailLogo from '../../assets/image/ponytail.png';
import raycastLogo from '../../assets/image/raycast.png';
import reiconLogo from '../../assets/image/reicon-logo.png';
import squirrelLogo from '../../assets/image/squirrel-logo.png';
import superpowersLogo from '../../assets/image/superpowers.png';
import tasteSkillLogo from '../../assets/image/taste-skill-logo.png';
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
            href: '/2026/grill-with-docs',
            logo: grillWithDocsLogo.src,
            name: 'grill-with-docs',
            note: '对计划或设计做追问，直到和 agent 达成同一理解，并把词汇和难定的决定写进仓库。',
          },
          {
            href: '/2026/ponytail',
            logo: ponytailLogo.src,
            name: 'ponytail',
            note: '给 AI coding agent 用的规则集。让它只写能完成任务的最少代码。',
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
          {
            href: 'https://www.tasteskill.dev/',
            logo: tasteSkillLogo.src,
            name: 'taste-skill',
            note: '给 AI agent 用的反套版前端框架。用开源 skill 文件，阻止 Cursor、Claude Code、Codex 等交出套路化的界面。',
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
          {
            href: 'https://diagramdesign.dev',
            logo: diagramDesignLogo.src,
            name: 'diagram-design',
            note: '给 agent 用的画图 skill。按你的品牌，把图输出成自包含的 HTML + SVG。',
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
      {
        href: 'https://rime.im/',
        logo: squirrelLogo.src,
        name: '鼠须管',
        note: 'Rime 在 macOS 上的输入法前端。用来输入中文。',
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
  {
    id: 'coding-agents',
    items: [
      {
        href: 'https://openai.com/codex/',
        invert: true,
        logo: codexLogo.src,
        name: 'codex',
        note: 'OpenAI 的编程 agent。在终端里查看、修改代码并运行命令。',
      },
      {
        href: 'https://claude.com/product/claude-code',
        logo: claudeCodeLogo.src,
        name: 'claude code',
        note: 'Anthropic 的编程 agent。读懂代码库，改文件、跑命令，把功能做出来。',
      },
      {
        href: 'https://opencode.ai/',
        logo: opencodeLogo.src,
        name: 'opencode',
        note: '开源的 AI coding agent。在终端、IDE 或桌面里帮你写代码。',
      },
      {
        href: 'https://cursor.com/',
        invert: true,
        logo: cursorLogo.src,
        name: 'cursor',
        note: '编程用的 agent。把想法交给它，由它做成软件。',
      },
    ],
    title: '编程 Agent',
  },
];

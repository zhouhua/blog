export type Type = 'github' | 'web' | 'obsidian' | 'gatsby';
export interface Project {
  name: string;
  description: string;
  link: string;
  type: Type;
  hidden?: boolean;
}

const list: Project[] = [
  {
    name: 'CSS 字体连字特性演示',
    description: '演示 font-feature-settings 的取值和效果',
    link: '/projects/font',
    type: 'web'
  },
  {
    name: 'Obsidian Export Image Plugin',
    description: 'Obsidian 插件，支持快速把文章导出成图片',
    link: 'https://github.com/zhouhua/obsidian-export-image',
    type: 'obsidian'
  },
  {
    name: 'Remark Media Card',
    description: 'Remark 插件，支持在 Markdown 中插入媒体（音乐、书籍、电影等）信息卡片',
    link: 'https://github.com/zhouhua/remark-media-card',
    type: 'github'
  },
  {
    name: 'Remark Media Card For Gatsby',
    description: 'Gatsby Remark 插件，是对 Remark Media Card 插件的包装，以支持在 Gatsby 中使用',
    link: 'https://github.com/zhouhua/remark-media-card-gatsby',
    type: 'gatsby'
  },
  {
    name: 'Excel 快速拆分表格',
    description: '尝试实现 WPS 付费会员的表格拆分功能，支持快速按行或按列拆分多表，灵活性非常强',
    link: '/projects/splitTable',
    type: 'web',
    hidden: true,
  },
  {
    name: 'Obsidian Power Mode',
    description: '把有趣的 Power Mode 引入到 obsidian 世界，包含屏幕抖动、combo 计数和许多文字爆炸特效',
    link: 'https://github.com/zhouhua/obsidian-power-mode',
    type: 'obsidian'
  },
  {
    name: 'Obsidian vConsole',
    description: '在 Obsidian 中集成 vConsole，方便开发人员调试',
    link: 'https://github.com/zhouhua/obsidian-vconsole',
    type: 'obsidian'
  },
  {
    name: 'Obsidian Another Sticky Headings',
    description: '在编辑和预览时在顶部固定显示标题树以指示当前位置',
    link: 'https://github.com/zhouhua/obsidian-sticky-headings',
    type: 'obsidian'
  },
  {
    name: 'Obsidian PopKit',
    description: '选中文字后即弹出快捷工具栏',
    link: 'https://github.com/zhouhua/obsidian-popkit',
    type: 'obsidian'
  },
];
export default list;

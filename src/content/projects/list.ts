export type Type = 'gatsby' | 'github' | 'obsidian' | 'web';
export interface Project {
  name: string;
  description: string;
  link: string;
  type: Type;
  hidden?: boolean;
}

const list: Project[] = [
  {
    description: '演示 font-feature-settings 的取值和效果',
    link: '/projects/font',
    name: 'CSS 字体连字特性演示',
    type: 'web',
  },
  {
    description: 'Obsidian 插件，支持快速把文章导出成图片',
    link: 'https://github.com/zhouhua/obsidian-export-image',
    name: 'Obsidian Export Image Plugin',
    type: 'obsidian',
  },
  {
    description: 'Remark 插件，支持在 Markdown 中插入媒体（音乐、书籍、电影等）信息卡片',
    link: 'https://github.com/zhouhua/remark-media-card',
    name: 'Remark Media Card',
    type: 'github',
  },
  {
    description: 'Gatsby Remark 插件，是对 Remark Media Card 插件的包装，以支持在 Gatsby 中使用',
    link: 'https://github.com/zhouhua/remark-media-card-gatsby',
    name: 'Remark Media Card For Gatsby',
    type: 'gatsby',
  },
  {
    description: '尝试实现 WPS 付费会员的表格拆分功能，支持快速按行或按列拆分多表，灵活性非常强',
    hidden: true,
    link: '/projects/splitTable',
    name: 'Excel 快速拆分表格',
    type: 'web',
  },
  {
    description: '把有趣的 Power Mode 引入到 obsidian 世界，包含屏幕抖动、combo 计数和许多文字爆炸特效',
    link: 'https://github.com/zhouhua/obsidian-power-mode',
    name: 'Obsidian Power Mode',
    type: 'obsidian',
  },
  {
    description: '在 Obsidian 中集成 vConsole，方便开发人员调试',
    link: 'https://github.com/zhouhua/obsidian-vconsole',
    name: 'Obsidian vConsole',
    type: 'obsidian',
  },
  {
    description: '在编辑和预览时在顶部固定显示标题树以指示当前位置',
    link: 'https://github.com/zhouhua/obsidian-sticky-headings',
    name: 'Obsidian Another Sticky Headings',
    type: 'obsidian',
  },
  {
    description: '选中文字后即弹出快捷工具栏',
    link: 'https://github.com/zhouhua/obsidian-popkit',
    name: 'Obsidian PopKit',
    type: 'obsidian',
  },
];
export default list;

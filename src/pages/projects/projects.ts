export type Type = 'github' | 'web';
export interface Project {
  name: string;
  description: string;
  link: string;
  type: Type;
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
    type: 'github'
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
    type: 'github'
  }
];
export default list;
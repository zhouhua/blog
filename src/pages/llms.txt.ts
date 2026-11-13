import type { APIRoute } from 'astro';
import { SITE } from '@consts';

export const prerender = true;

const posts = [
  {
    description: '聊天助手读的是 HTML。编程 Agent 会在 Accept 里要 Markdown。llms.txt 放在这些事情之后。',
    path: '/2026/llm-site-visibility.md',
    title: '让网站被 LLM 和 Agent 看见',
  },
  {
    description: '在自己的域名上发布发现索引和安装文件，并为每份文件附上校验摘要，让任何 Agent 都能装上。',
    path: '/2026/agent-skills-discovery.md',
    title: '像发布软件包一样发布 Agent Skills',
  },
  {
    description: '在存量 iOS App 里嵌 React Native：独立 Framework 与自建 OTA 的一条可行路径。',
    path: '/2026/ios-rn-brownfield.md',
    title: '在存量 iOS App 里嵌 React Native：独立 Framework + 自建 OTA',
  },
  {
    description: '登录 token 放 localStorage、内存还是 Cookie，以及服务端还要不要记账。',
    path: '/2026/auth-token-storage.md',
    title: '登录凭证放哪更安全',
  },
  {
    description: '对外契约该以 OpenAPI 为中心，而不是指望从 Thrift 翻译出好用的 HTTP 面。',
    path: '/2026/openapi-contract-center.md',
    title: '为什么 API 契约中心该是 OpenAPI，而不是 Thrift',
  },
  {
    description: '把 HTTPS 里的协议、证书、套件、HSTS、OCSP 串成一条能动手配置的线。',
    path: '/2026/https-concepts.md',
    title: 'HTTPS 该搞清楚的几件事',
  },
  {
    description: 'Let\'s Encrypt 背后那套协议：挑战是什么、HTTP-01 和 DNS-01 怎么验。',
    path: '/2026/dns-acme-challenge.md',
    title: 'ACME 该搞清楚的几件事',
  },
  {
    description: '一份带主张的 HTML 样板，逐项说明 head 和 body 里的标签为何这样写。',
    path: '/2026/html-boilerplate.md',
    title: '我的 HTML 样板',
  },
];

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? 'https://zhouhua.site';
  const lines = [
    `# ${SITE.NAME}`,
    '',
    '> 技术文章。下面的链接是 Markdown 版本。',
    '',
    '## 文章',
    '',
    ...posts.map(post => `- [${post.title}](${origin}${post.path}): ${post.description}`),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

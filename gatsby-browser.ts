import './src/styles/global.css';
import 'prismjs/themes/prism-tomorrow.min.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.min.css';
import 'prismjs/plugins/command-line/prism-command-line.min.css';
import 'katex/dist/katex.min.css';
import gatsbyOnInitialClientRender from './src/gatsby/browser/onInitialClientRender';
import gatsbyOnRouteUpdate from './src/gatsby/browser/onRouteUpdate';
import gatsbyShouldUpdateScroll from './src/gatsby/browser/shouldUpdateScroll';
import gatsbyWrapRootElement from './src/gatsby/browser/wrapRootElement';

export const onInitialClientRender = gatsbyOnInitialClientRender;
export const onRouteUpdate = gatsbyOnRouteUpdate;
export const shouldUpdateScroll = gatsbyShouldUpdateScroll;
export const wrapRootElement = gatsbyWrapRootElement;

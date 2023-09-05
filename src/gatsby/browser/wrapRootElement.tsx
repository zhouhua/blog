import type { GatsbyBrowser } from 'gatsby';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import '../../styles/global.css';
import 'prismjs/themes/prism-tomorrow.min.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.min.css';
import 'prismjs/plugins/command-line/prism-command-line.min.css';
import 'katex/dist/katex.min.css';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({ element }) => element;

export default wrapRootElement;

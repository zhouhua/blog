import type { GatsbyBrowser } from 'gatsby';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

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

const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({ element }) => (
  <>
    {process.env.NODE_ENV !== 'devlopment' ? (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            var _hmt = _hmt || [];
            (function() {
              var src = "https://hm.baidu.com/hm.js?4ba41c610c84f57d1dce873524e57a7c";
              var s = document.getElementsByTagName("script")[0];
              if(s.getAttribute('src') !== src) {
                var hm = document.createElement("script");
                hm.src = src;
                s.parentNode.insertBefore(hm, s);
              }
            })();`
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-KM74RM0181" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){
            dataLayer.push(arguments);
          }
          gtag('js', new Date());
          gtag('config', 'G-KM74RM0181');`
          }}
        />
      </>
    ) : null}
    {element}
    {process.env.NODE_ENV !== 'devlopment' ? (
      <>
        <Analytics />
        <SpeedInsights />
      </>
    ) : null}
  </>
);

export default wrapRootElement;

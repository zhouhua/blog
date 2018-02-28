import React from 'react';

let stylesStr;
if (process.env.NODE_ENV === 'production') {
    try {
        stylesStr = require('!raw-loader!../public/styles.css');
    }
    catch (e) {
        console.log(e);
    }
}

module.exports = class HTML extends React.Component {
    render() {
        let css;
        if (process.env.NODE_ENV === 'production') {
            css = (
                <style
                    id="gatsby-inlined-css"
                    dangerouslySetInnerHTML={{ __html: stylesStr }}
                />
            );
        }
        return (
            <html {...this.props.htmlAttributes}>
                <head>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="x-ua-compatible" content="ie=edge" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1, shrink-to-fit=no"
                    />
                    <meta name="google-site-verification" content="H3GRerWi10v9pEgpKP6bhB4RbEEEJ-P3MlMdKdim_DA" />
                    {this.props.headComponents}
                    {css}
                    <script dangerouslySetInnerHTML={{
                        __html: `var _hmt = _hmt || [];
                        (function() {
                        var hm = document.createElement("script");
                        hm.src = "https://hm.baidu.com/hm.js?681b6a0273ee13c3711590262c9b86b7";
                        var s = document.getElementsByTagName("script")[0]; 
                        s.parentNode.insertBefore(hm, s);
                        })();`
                    }}
                    />

                </head>
                <body {...this.props.bodyAttributes}>
                    {this.props.preBodyComponents}
                    <div
                        key="body"
                        id="___gatsby"
                        dangerouslySetInnerHTML={{ __html: this.props.body }}
                    />
                    {this.props.postBodyComponents}
                    <script dangerouslySetInnerHTML={{
                        __html: `(function(){
                            var bp = document.createElement('script');
                            var curProtocol = window.location.protocol.split(':')[0];
                            if (curProtocol === 'https'){
                        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
                        }
                        else{
                        bp.src = 'http://push.zhanzhang.baidu.com/push.js';
                        }
                            var s = document.getElementsByTagName("script")[0];
                            s.parentNode.insertBefore(bp, s);
                        })();`
                    }}
                    />
                </body>
            </html>
        );
    }
};

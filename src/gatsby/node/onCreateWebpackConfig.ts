import path from 'path';
import type { GatsbyNode } from 'gatsby';
import type { Configuration, RuleSetRule } from 'webpack';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { defaultGetLocalIdent } from './utils';

interface IUse {
  ident?: string;
  loader?: string;
  options?: { [index: string]: any };
}
const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({ actions, getConfig }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, '../../components/'),
        '@icons': path.resolve(__dirname, '../../icons/'),
        '@styles': path.resolve(__dirname, '../../styles/'),
        '@utils': path.resolve(__dirname, '../../utils/'),
        '@hooks': path.resolve(__dirname, '../../hooks/')
      },
      extensions: ['.js', '.json', '.ts', '.tsx'],
      modules: [path.resolve(__dirname, '../../'), 'node_modules']
    }
  });
  const config = getConfig() as Configuration;
  const rules = (config.module?.rules?.find(r => !!(r as RuleSetRule)?.oneOf) || []) as RuleSetRule;
  rules.oneOf?.forEach(loaders => {
    if (!loaders) {
      return;
    }
    if (Array.isArray(loaders.use)) {
      loaders.use.forEach(use => {
        if (!use) {
          return;
        }
        if (
          typeof use !== 'string' &&
          typeof (use as IUse).loader === 'string' &&
          /(?<!post)css-loader/.test((use as IUse).loader || '')
        ) {
          if (!(use as IUse).options?.modules) {
            return;
          }
          const { getLocalIdent, ...others } = (use as IUse).options!.modules;
          (use as IUse).options = {
            ...(use as IUse).options,
            modules: {
              ...others,
              localIdentName: '[path]__[local]--[hash:base64:5]',
              getLocalIdent(ctx: any, localIdentName: string, localName: string, ...args: any[]) {
                if (localName === 'dark') {
                  return (getLocalIdent || defaultGetLocalIdent)(
                    ctx,
                    localName,
                    localName,
                    ...args
                  );
                }
                return (getLocalIdent || defaultGetLocalIdent)(
                  ctx,
                  `[path]__${localName}--[hash:base64:5]`,
                  localName,
                  ...args
                );
              }
            }
          };
        }
      });
    }
  });
  const plugins = config.plugins || [];
  const pluginIndex = plugins.findIndex(p => p instanceof MiniCssExtractPlugin);
  if (pluginIndex >= 0) {
    plugins[pluginIndex] = new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
      ignoreOrder: true,
      insert: (linkTag: HTMLLinkElement) =>
        document.getElementsByTagName('head')[0].prepend(linkTag)
    });
  }
  actions.replaceWebpackConfig(config);
};

export default onCreateWebpackConfig;

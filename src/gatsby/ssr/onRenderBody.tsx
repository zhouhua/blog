import type { GatsbySSR } from 'gatsby';
import InitColorMode from './InitColorMode';

const onRenderBody: GatsbySSR['onRenderBody'] = ({ setPreBodyComponents }) => {
  setPreBodyComponents([<InitColorMode />]);
};
export default onRenderBody;

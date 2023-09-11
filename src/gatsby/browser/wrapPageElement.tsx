import { AnimatePresence } from 'framer-motion';
import type { GatsbyBrowser } from 'gatsby';

const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({ element }) => (
  <AnimatePresence mode="wait">{element}</AnimatePresence>
);
export default wrapPageElement;

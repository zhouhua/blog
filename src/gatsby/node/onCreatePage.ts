import { GatsbyNode } from 'gatsby';

const onCreatePage: GatsbyNode['onCreatePage'] = ({ page, actions }) => {
  if (page.context?.slug) {
    return;
  }
  console.log(page);
};
export default onCreatePage;

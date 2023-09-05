import gatsbyCreatePages from './src/gatsby/node/createPages';
import gatsbyOnCreateNode from './src/gatsby/node/onCreateNode';
import gatsbyCreateSchemaCustomization from './src/gatsby/node/createSchemaCustomization';
import gatsbyOnCreateWebpackConfig from './src/gatsby/node/onCreateWebpackConfig';

export const createPages = gatsbyCreatePages;
export const onCreateNode = gatsbyOnCreateNode;
export const createSchemaCustomization = gatsbyCreateSchemaCustomization;
export const onCreateWebpackConfig = gatsbyOnCreateWebpackConfig;

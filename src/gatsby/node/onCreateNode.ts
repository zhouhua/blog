/* eslint-disable no-prototype-builtins */
import { createFilePath } from 'gatsby-source-filesystem';
import { kebabCase } from 'lodash';
import type { GatsbyNode } from 'gatsby';
import dayjs from 'dayjs';
import { slugForI18n } from './utils';

// Create fields for post slugs and source
// This will change with schema customization with work
const onCreateNode: GatsbyNode['onCreateNode'] = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  if (node.internal.type === 'File') {
    createNodeField({
      node,
      name: 'slug',
      value: slugForI18n(createFilePath({ node, getNode })),
    });
  } else if (node.internal.type === 'MarkdownRemark') {
    const markdownNode = node as unknown as Queries.MarkdownRemark;
    const basename = createFilePath({ node: markdownNode as any, getNode });
    let slug = basename;
    if (typeof markdownNode.frontmatter?.path !== 'undefined') {
      slug = markdownNode.frontmatter.path || '';
    }
    if (markdownNode.frontmatter.layout === 'journal') {
      slug = `/journals/#journal${dayjs(markdownNode.frontmatter.date).format('YYYY-MM-DD')}`;
      if (/\.en$/.test(basename)) {
        slug = `/en${slug}`;
      }
    }
    createNodeField({
      node: markdownNode as any,
      name: 'slug',
      value: slug,
    });
    const regexp = /([^0-1a-z-])/gi;
    if (markdownNode.frontmatter?.tags) {
      const tagSlugs = markdownNode.frontmatter.tags
        .map(tag => kebabCase(tag || ''))
        .map(
          tag => `/tag/${tag.replaceAll(regexp, match => Buffer.from(match).toString('base64'))}`,
        )
        .map(slug => (/\.en$/.test(basename) ? `/en${slug}` : slug));
      createNodeField({ node: markdownNode as any, name: 'tagSlugs', value: tagSlugs });
    }
  } else if (node.internal.type === 'photo') {
    const photoNode = {
      ...(node as unknown as Queries.photo),
    };
    const slug = createFilePath({ node: photoNode as any, getNode });
    createNodeField({
      node: photoNode as any,
      name: 'slug',
      value: slugForI18n(`/photo${slug}`),
    });
  }
};
export default onCreateNode;

import type { GatsbyNode } from 'gatsby';

const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({ actions }) => {
  const { createTypes } = actions;

  const typeDefs = [
    `
    type Site {
      siteMetadata: SiteSiteMetadata!
    }
    type SiteSiteMetadata {
      copyright: String!
      description: String!
      hero: SiteSiteMetadataHero!
      siteUrl: String!
      subtitle: String!
      title: String!,
      menu: [SiteSiteMetadataMenu!]!
    }
    type SiteSiteMetadataHero {
      heading: String!
      maxWidth: String!
    }
    type SiteSiteMetadataMenu {
      name: String!
      path: String!
      icon: String!
    }
    `,
    `
    type MarkdownRemark implements Node {
      excerpt: String!
      fields: MarkdownRemarkFields!
      frontmatter: MarkdownRemarkFrontmatter!
      html: String!
      rawMarkdownBody: String!
      tableOfContents: String!
      timeToRead: Int!
      wordCount: MarkdownWordCount!
    }
    type MarkdownRemarkFields {
      slug: String!
      tagSlugs: [String!]
    }
    type MarkdownRemarkFrontmatter {
      category: String!
      date: Date!
      description: String!
      layout: String!
      path: String!
      tags: [String!]
      title: String!
    }
    type MarkdownWordCount {
      paragraphs: Int!
      sentences: Int!
      words: Int!
    }
    `,
    `
    type AuthorsYaml implements Node{
      authorsPage: String!
      bio: String!
      featured: Boolean!
      name: String!
      social: [AuthorsYamlSocial!]!
    }
    type AuthorsYamlSocial {
      url: String!
    }
    `,
    `
    type photo implements Node{
      layout: String!
      title: String!
      date: Date!
      fields: photoFields!
      list: [photoList!]!
    }
    type photoFields {
      slug: String!
    }
    type photoList {
      description: String!
      featured: Boolean
    }
    `
  ];

  createTypes(typeDefs);
};

export default createSchemaCustomization;

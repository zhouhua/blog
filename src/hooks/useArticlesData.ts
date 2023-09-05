import { graphql, useStaticQuery } from 'gatsby';

export const useArticlesData = ({
  tag,
  layout,
  slug
}: {
  tag?: string;
  layout?: string;
  slug?: string;
}) => {
  const data = useStaticQuery<Queries.Query>(graphql`
    query {
      allMarkdownRemark(
        sort: { frontmatter: { date: DESC } }
        limit: 1000
        filter: { frontmatter: { date: { ne: null }, title: { ne: null } } }
      ) {
        edges {
          node {
            id
            fields {
              # categorySlug
              slug
              tagSlugs
            }
            frontmatter {
              title
              date
              draft
              tags
              layout
              hero {
                childImageSharp {
                  gatsbyImageData(
                    width: 1560
                    layout: CONSTRAINED
                    placeholder: BLURRED
                    formats: [AUTO, WEBP]
                  )
                }
              }
            }
            excerpt(pruneLength: 120, truncate: true)
            timeToRead
            wordCount {
              paragraphs
              sentences
              words
            }
          }
        }
      }
    }
  `);
  return data.allMarkdownRemark.edges
    .map(({ node }) => node)
    .filter(node => (tag ? (node.frontmatter.tags || []).includes(tag) : true))
    .filter(node => (layout ? node.frontmatter.layout === layout : true))
    .filter(node => (slug ? node.fields.slug === slug : true));
};

export default useArticlesData;

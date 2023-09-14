const indexName = 'blog';

const pageQuery = `{
  allMarkdownRemark(
    filter: {
      fileAbsolutePath: { regex: "/pages/" },
      internal: {contentDigest: {ne: ""}}
    }
  ) {
    edges {
      node {
        id
        frontmatter {
          title
          layout
        }
        fields {
          slug
        }
        internal {
          contentDigest
        }
        excerpt(pruneLength: 3000)
      }
    }
  }
}`;

function pageToAlgoliaRecord({
  node: { id, frontmatter, fields, internal, ...rest }
}: Queries.MarkdownRemarkEdge) {
  const data = {
    objectID: id,
    ...frontmatter,
    ...fields,
    ...internal,
    ...rest,
    id
  };
  if (data.contentDigest) {
    Object.assign(data, { internal: { contentDigest: data.contentDigest } });
  }
  if (data.layout === 'journal') {
    data.title = `随笔 🗓️ ${data.slug.split('#journal').pop()}`;
  }

  return data;
}

const queries = [
  {
    query: pageQuery,
    transformer: ({ data }: { data: Queries.Query }) =>
      data.allMarkdownRemark.edges.map(pageToAlgoliaRecord),
    indexName,
    settings: { attributesToSnippet: ['excerpt:40'] }
  }
];
export default queries;

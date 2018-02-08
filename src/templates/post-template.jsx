import React from 'react';
import Helmet from 'react-helmet';
import PostTemplateDetails from '../components/PostTemplateDetails';

class PostTemplate extends React.Component {
    render() {
        const { title, subtitle } = this.props.data.site.siteMetadata;
        const post = this.props.data.markdownRemark;
        const { title: postTitle, description: postDescription } = post.frontmatter;
        const description = postDescription || post.excerpt || subtitle;

        return (
            <div>
                <Helmet>
                    <title>{`${postTitle} - ${title}`}</title>
                    <meta name="description" content={description} />
                </Helmet>
                <PostTemplateDetails {...this.props} />
            </div>
        );
    }
}

export default PostTemplate;

export const pageQuery = graphql`
  query PostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        subtitle
        copyright
        author {
          name
          rss
          email
          github
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      excerpt
      fields {
        tagSlugs
      }
      frontmatter {
        title
        tags
        date
        description
      }
    }
  }
`;

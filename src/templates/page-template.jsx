import React from 'react';
import Helmet from 'react-helmet';
import PageTemplateDetails from '../components/PageTemplateDetails';

class PageTemplate extends React.Component {
    render() {
        const { title, subtitle } = this.props.data.site.siteMetadata;
        const page = this.props.data.markdownRemark;
        const { title: pageTitle, description: pageDescription } = page.frontmatter;
        const description = pageDescription || page.excerpt || subtitle;
        console.log(page.excerpt);

        return (
            <div>
                <Helmet>
                    <title>{`${pageTitle} - ${title}`}</title>
                    <meta name="description" content={description} />
                </Helmet>
                <PageTemplateDetails {...this.props} />
            </div>
        );
    }
}

export default PageTemplate;

export const pageQuery = graphql`
  query PageBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        subtitle
        copyright
        menu {
          label
          path
        }
        author {
          name
          email
          github
          rss
        }
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      excerpt
      frontmatter {
        title
        date
        description
      }
    }
  }
`;

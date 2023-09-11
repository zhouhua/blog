import { graphql, useStaticQuery } from 'gatsby';

const useSiteMetadata = () => {
  const data = useStaticQuery<Queries.Query>(graphql`
    query {
      site {
        siteMetadata {
          title
          siteUrl
          subtitle
          menu {
            name
            path
            icon
          }
        }
      }
    }
  `);

  return data.site!.siteMetadata;
};
export default useSiteMetadata;

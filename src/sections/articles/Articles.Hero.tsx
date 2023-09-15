import { useContext } from 'react';
import type { FC } from 'react';
import { Link, graphql, useStaticQuery } from 'gatsby';
import clsx from 'clsx';
import Section from '@components/Section';
import Bio from '@components/Bio';
import Icons from '@icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { GridLayoutContext } from './Articles.List.Context';
import * as styles from './index.module.css';

const authorQuery = graphql`
  {
    site: allSite {
      edges {
        node {
          siteMetadata {
            subtitle
            hero {
              heading
              maxWidth
            }
          }
        }
      }
    }
    author: allAuthorsYaml {
      edges {
        node {
          authorsPage
          bio
          id
          name
          featured
          social {
            url
          }
          avatar {
            childImageSharp {
              gatsbyImageData(
                layout: CONSTRAINED
                width: 100
                quality: 80
                placeholder: DOMINANT_COLOR
              )
            }
          }
        }
      }
    }
  }
`;

const ArticlesHero: FC<{ tag?: string; showLayout?: boolean; title?: string }> = ({
  tag,
  showLayout = false,
  title
}) => {
  const { gridLayout = 'tiles', hasSetGridLayout, setGridLayout } = useContext(GridLayoutContext);

  const results = useStaticQuery(authorQuery);
  const { hero, subtitle } = results.site.edges[0].node.siteMetadata;
  const author: Queries.AuthorsYaml = results.author.edges[0].node;
  const tilesIsActive = hasSetGridLayout && gridLayout === 'tiles';

  if (!author) {
    throw new Error(`
      No featured Author found.
      Please ensure you have at least featured Author.
  `);
  }

  return (
    <Section narrow>
      {tag ? (
        <div className="my-28 flex items-center justify-between sm:my-10 md:my-16">
          <h1
            className={clsx(
              styles.HeroHeading,
              'colorModeTransition text-[36px] font-semibold not-italic leading-[1.15]',
              'text-palette-primary sm:text-[24px] md:text-[30px]'
            )}
          >
            关于
            <small>
              <FontAwesomeIcon
                icon={faHashtag}
                className="text-palette-accent ml-2 mr-1 opacity-70"
              />
            </small>
            {tag} 的文章：
          </h1>
          <Link
            to="/articles"
            className="hover:text-palette-accent hover:underline hover:underline-offset-4 sm:hidden"
          >
            <FontAwesomeIcon icon={faAngleRight} className="mr-2" />
            所有文章
          </Link>
        </div>
      ) : (
        <div
          className={clsx('text-palette-primary mx-0 my-[100px] sm:w-full md:w-4/5')}
          style={{ maxWidth: `${hero.maxWidth}px` }}
        >
          <h1
            className={clsx(
              styles.HeroHeading,
              'colorModeTransition text-[52px] font-semibold not-italic leading-[1.15]',
              'mb-10 sm:text-[32px] md:text-[38px]'
            )}
          >
            {title || hero.heading}
          </h1>
          {!title && <p className="colorModeTransition">{subtitle}</p>}
        </div>
      )}
      <div className="mb-[100px] flex items-center justify-between sm:hidden md:mb-20">
        <Bio author={author} />
        {showLayout && (
          <div className="sm:hidden; flex items-center">
            <button
              type="button"
              className={clsx(styles.GridButton, { [styles.active]: tilesIsActive }, 'mr-[30px]')}
              onClick={() => setGridLayout!('tiles')}
              data-a11y="false"
              title="Show articles in Tile grid"
              aria-label="Show articles in Tile grid"
            >
              <Icons.Tiles />
            </button>
            <button
              type="button"
              className={clsx(styles.GridButton, { [styles.active]: !tilesIsActive })}
              onClick={() => setGridLayout!('rows')}
              data-a11y="false"
              title="Show articles in Row grid"
              aria-label="Show articles in Row grid"
            >
              <Icons.Rows />
            </button>
          </div>
        )}
      </div>
    </Section>
  );
};

export default ArticlesHero;

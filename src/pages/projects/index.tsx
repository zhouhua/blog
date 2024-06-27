import Layout from '@components/Layout';
import Section from '@components/Section';
import type { PageProps } from 'gatsby';
import type { FC } from 'react';

import useSiteMetadata from '@hooks/useSiteMetaData';
import { Icon } from '@iconify/react';
import ArticlesHero from '../../sections/articles/Articles.Hero';
import type { Type } from '../../utils/projects';
import projects from '../../utils/projects';

const iconMap: Record<Type, string> = {
  web: 'mdi:cellphone-link',
  github: 'mdi:github',
  obsidian: 'simple-icons:obsidian',
  gatsby: 'ri:gatsby-fill',
};

const Projects: FC<PageProps> = () => {
  const { title } = useSiteMetadata();
  return (
    <Layout>
      <ArticlesHero title={`${title} - 一些小项目`} description="自娱自乐的空间" />
      <Section narrow />
      <ul className="mx-auto max-w-[560px] text-center">
        {projects.filter(p => !p.hidden).map(({ name, description, link, type }) => (
          <li key={name} className="mt-20">
            <a href={link} target={/^https?:/.test(link) ? '_blank' : '_self'}>
              <h3 className="text-2xl text-palette-secondary">
                <Icon icon={iconMap[type]} className="mr-4" />
                {name}
              </h3>
              {description && <p className="mt-2 text-palette-gray">{description}</p>}
            </a>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default Projects;

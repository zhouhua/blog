import rss from '@astrojs/rss';
import { HOME } from '@consts';
import { getCollection } from 'astro:content';

interface Context {
  site: string;
}

export async function GET(context: Context) {
  const blog = await getCollection('blog');

  const items = blog
    .sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());

  return rss({
    description: HOME.DESCRIPTION,
    items: items.map(item => ({
      description: item.data.description,
      link: `/${item.id}/`,
      pubDate: item.data.date,
      title: item.data.title,
    })),
    site: context.site,
    title: HOME.TITLE,
  });
}

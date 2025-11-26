import type { APIRoute } from 'astro';
import dayjs from '@lib/dayjs';
import { murmurHash } from 'ohash';
import db from './_db';
import { base62 } from './_utils';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (key) {
    try {
      const item = await db.selectFrom('links').select(['value']).where('key', '=', key).executeTakeFirst();
      if (item?.value) {
        await db.updateTable('links').set({ last_use: new Date() }).where('key', '=', key).execute();
        return new Response(
          JSON.stringify({ code: 0, key, value: item.value }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            status: 200,
          },
        );
      }
    }
    catch (e) { }
  }
  return new Response(JSON.stringify({ code: 1 }), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 404,
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const value = (body satisfies { value: string }).value.trim();
  if (value) {
    try {
      let maxRety = 10;
      let padding = '';
      let key = '';
      while (maxRety) {
        key = base62(+murmurHash(value + padding));
        const item = await db.selectFrom('links').selectAll().where('key', '=', key).executeTakeFirst();
        if (!item) {
          await db.insertInto('links').values({ key, last_use: new Date(), value }).execute();
          break;
        }
        else if (item.value === value) {
          await db.updateTable('links').set({ last_use: new Date() }).where('key', '=', key).execute();
          break;
        }
        else if (dayjs().subtract(3, 'M').isAfter(dayjs(item.last_use))) {
          await db.updateTable('links').set({ last_use: new Date(), value }).where('key', '=', key).execute();
          break;
        }
        else {
          maxRety--;
          padding += ' ';
        }
      }
      if (maxRety > 0 && key) {
        return new Response(
          JSON.stringify({ code: 0, key }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            status: 200,
          },
        );
      }
      return new Response(
        JSON.stringify({ code: 1, message: '生成失败' }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        },
      );
    }
    catch (e) { }
  }
  return new Response(JSON.stringify({ code: 1 }), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
  });
};

export const PUT: APIRoute = async (context) => {
  return POST(context);
};

export const DELETE: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { key } = body;
  if (key) {
    try {
      await db.deleteFrom('links').where('key', '=', key).execute();
      return new Response(
        JSON.stringify({ code: 0 }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 200,
        },
      );
    }
    catch (e) { }
  }
  return new Response(JSON.stringify({ code: 1 }), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
  });
};

export const prerender = false;

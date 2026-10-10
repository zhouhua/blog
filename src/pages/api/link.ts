import type { APIRoute } from 'astro';
import { apiLogger } from '@lib/logger';
import db from './_db';
import { createLinkSchema, deleteLinkSchema, getLinkSchema } from './_schemas';
import { createLinkKey, isUniqueViolation } from './_utils';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response(JSON.stringify({ code: 1, message: '缺少 key 参数' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  const validation = getLinkSchema.safeParse({ key });
  if (!validation.success) {
    return new Response(
      JSON.stringify({
        code: 1,
        errors: validation.error.issues,
        message: '无效的 key',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }

  try {
    const item = await db
      .selectFrom('links')
      .select(['value'])
      .where('key', '=', validation.data.key)
      .executeTakeFirst();

    if (item?.value) {
      db.updateTable('links')
        .set({ last_use: new Date() })
        .where('key', '=', validation.data.key)
        .execute()
        .catch(err => apiLogger.error('Failed to update last_use', err, { key: validation.data.key }));

      return new Response(JSON.stringify({ code: 0, key: validation.data.key, value: item.value }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ code: 1, message: '短链接不存在' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });
  }
  catch (error) {
    apiLogger.error('Database error in GET /api/link', error);
    return new Response(JSON.stringify({ code: 1, message: '服务器错误' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validation = createLinkSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          code: 1,
          errors: validation.error.issues,
          message: '无效的输入',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    const { value } = validation.data;
    let maxRetry = 10;
    let padding = '';
    let key = '';

    while (maxRetry > 0) {
      key = createLinkKey(value + padding);

      const item = await db.selectFrom('links').selectAll().where('key', '=', key).executeTakeFirst();

      if (!item) {
        try {
          await db.insertInto('links').values({ key, last_use: new Date(), value }).execute();
          break;
        }
        catch (error) {
          // Concurrent insert on the same key — re-check instead of failing hard.
          if (!isUniqueViolation(error)) {
            throw error;
          }
          const raced = await db.selectFrom('links').selectAll().where('key', '=', key).executeTakeFirst();
          if (raced?.value === value) {
            await db.updateTable('links').set({ last_use: new Date() }).where('key', '=', key).execute();
            break;
          }
          maxRetry--;
          padding += ' ';
          continue;
        }
      }
      else if (item.value === value) {
        await db.updateTable('links').set({ last_use: new Date() }).where('key', '=', key).execute();
        break;
      }
      else {
        maxRetry--;
        padding += ' ';
      }
    }

    if (maxRetry > 0 && key) {
      return new Response(JSON.stringify({ code: 0, key }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ code: 1, message: '生成失败，请重试' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
  catch (error) {
    apiLogger.error('Database error in POST /api/link', error);
    return new Response(JSON.stringify({ code: 1, message: '服务器错误' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

export const PUT: APIRoute = async (context) => {
  return POST(context);
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validation = deleteLinkSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          code: 1,
          errors: validation.error.issues,
          message: '无效的输入',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    await db.deleteFrom('links').where('key', '=', validation.data.key).execute();

    return new Response(JSON.stringify({ code: 0 }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }
  catch (error) {
    apiLogger.error('Database error in DELETE /api/link', error);
    return new Response(JSON.stringify({ code: 1, message: '服务器错误' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

export const prerender = false;

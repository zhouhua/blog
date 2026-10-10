import type { APIRoute } from 'astro';
import { apiLogger } from '@lib/logger';
import db from '@pages/api/_db';
import { getLinkSchema } from '@pages/api/_schemas';
import { isAllowedRedirectUrl } from '@pages/api/_utils';

export const prerender = false;

export const GET: APIRoute = async ({ params, redirect, rewrite }) => {
  const validation = getLinkSchema.safeParse({ key: params.key });
  if (!validation.success) {
    return rewrite('/404');
  }

  const { key } = validation.data;

  try {
    const item = await db.selectFrom('links').select(['value']).where('key', '=', key).executeTakeFirst();
    if (item?.value && isAllowedRedirectUrl(item.value)) {
      await db.updateTable('links').set({ last_use: new Date() }).where('key', '=', key).execute();
      return redirect(item.value, 302);
    }
  }
  catch (error) {
    apiLogger.error('Database error in GET /i/[key]', error, { key });
    return new Response(JSON.stringify({ code: 1, message: '服务器错误' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  return rewrite('/404');
};

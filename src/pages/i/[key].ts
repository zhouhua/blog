import type { APIRoute } from 'astro';
import db from '@pages/api/_db';

export const GET: APIRoute = async ({ params, redirect, rewrite }) => {
  const { key } = params;
  if (key) {
    try {
      const item = await db.selectFrom('links').select(['value']).where('key', '=', key).executeTakeFirst();
      if (item?.value) {
        await db.updateTable('links').set({ last_use: new Date() }).where('key', '=', key).execute();
        return redirect(item.value, 302);
      }
    }
    catch (e) { }
  }
  return rewrite('/404');
};

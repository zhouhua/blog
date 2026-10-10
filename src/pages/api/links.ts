import type { APIRoute } from 'astro';
import { apiLogger } from '@lib/logger';
import db from './_db';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const list = await db.selectFrom('links').selectAll().orderBy('last_use', 'desc').execute();
    return new Response(
      JSON.stringify({ code: 0, list: list || [] }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  }
  catch (error) {
    apiLogger.error('Database error in GET /api/links', error);
    return new Response(JSON.stringify({ code: 1, message: '服务器错误' }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
};

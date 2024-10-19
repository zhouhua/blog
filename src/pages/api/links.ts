import type { APIRoute } from 'astro';
import db from './_db';

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
  catch (e) { }

  return new Response(JSON.stringify({ code: 1 }), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 404,
  });
};

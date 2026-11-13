import { isArticlePath, selectRepresentation } from '@lib/negotiate-markdown';
import { defineMiddleware } from 'astro:middleware';

function logNegotiation(result: 'markdown' | 'not-acceptable', request: Request, pathname: string) {
  // Vercel keeps this line in the request log so crawlers and on-demand fetches stay distinguishable.
  // eslint-disable-next-line no-console
  console.info(JSON.stringify({
    event: 'content-negotiation',
    path: pathname,
    result,
    userAgent: request.headers.get('user-agent') ?? '',
  }));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const markdownSource = pathname.endsWith('.md') ? pathname.slice(0, -3) : null;
  const isMarkdownArticle = markdownSource !== null && isArticlePath(markdownSource);
  const isHtmlArticle = isArticlePath(pathname);

  if (!isHtmlArticle && !isMarkdownArticle) {
    return next();
  }

  const choice = selectRepresentation(context.request.headers.get('accept'));

  if (isMarkdownArticle) {
    const response = await next();
    response.headers.set('Vary', 'Accept');
    response.headers.set('Link', `<${markdownSource}>; rel="alternate"; type="text/html"`);
    if (response.ok) {
      logNegotiation('markdown', context.request, pathname);
    }
    return response;
  }

  if (choice === 'none') {
    logNegotiation('not-acceptable', context.request, pathname);
    return new Response('Not Acceptable', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Link': `<${pathname}>; rel="alternate"; type="text/html", <${pathname}.md>; rel="alternate"; type="text/markdown"`,
        'Vary': 'Accept',
      },
      status: 406,
    });
  }

  if (choice === 'markdown') {
    const response = await context.rewrite(`${pathname}.md`);
    response.headers.set('Vary', 'Accept');
    return response;
  }

  const response = await next();
  response.headers.set('Vary', 'Accept');
  response.headers.append('Link', `<${pathname}.md>; rel="alternate"; type="text/markdown"`);
  return response;
});

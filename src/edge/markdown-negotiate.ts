import { isArticlePath, selectRepresentation } from '../lib/negotiate-markdown';

function htmlAlternate(pathname: string) {
  return `<${pathname}>; rel="alternate"; type="text/html"`;
}

function markdownAlternate(pathname: string) {
  return `<${pathname}.md>; rel="alternate"; type="text/markdown"`;
}

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

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;
  const markdownSource = pathname.endsWith('.md') ? pathname.slice(0, -3) : null;
  const isMarkdownArticle = markdownSource !== null && isArticlePath(markdownSource);

  if (isMarkdownArticle) {
    logNegotiation('markdown', request, pathname);
    return new Response(null, {
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'link': htmlAlternate(markdownSource),
        'vary': 'Accept',
        'x-middleware-next': '1',
      },
    });
  }

  if (!isArticlePath(pathname)) {
    return new Response(null, {
      headers: { 'x-middleware-next': '1' },
    });
  }

  const choice = selectRepresentation(request.headers.get('accept'));

  if (choice === 'none') {
    logNegotiation('not-acceptable', request, pathname);
    return new Response('Not Acceptable', {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'link': `${htmlAlternate(pathname)}, ${markdownAlternate(pathname)}`,
        'vary': 'Accept',
      },
      status: 406,
    });
  }

  if (choice === 'markdown') {
    const rewriteUrl = new URL(request.url);
    rewriteUrl.pathname = `${pathname}.md`;
    logNegotiation('markdown', request, pathname);
    return new Response(null, {
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'link': htmlAlternate(pathname),
        'vary': 'Accept',
        'x-middleware-rewrite': rewriteUrl.toString(),
      },
    });
  }

  return new Response(null, {
    headers: {
      'link': markdownAlternate(pathname),
      'vary': 'Accept',
      'x-middleware-next': '1',
    },
  });
}

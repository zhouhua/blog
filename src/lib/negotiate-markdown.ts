interface AcceptEntry {
  q: number;
  type: string;
}

export type Representation = 'html' | 'markdown' | 'none';

const ARTICLE_PATH_RE = /^\/\d{4}\/[^./]+$/;

export function isArticlePath(pathname: string) {
  return ARTICLE_PATH_RE.test(pathname);
}

export function parseAccept(header: null | string): AcceptEntry[] {
  if (!header?.trim()) {
    return [{ q: 1, type: '*/*' }];
  }

  const entries = header.split(',')
    .map((part) => {
      const [type = '', ...params] = part.trim().split(';');
      const qualityParam = params.find(param => param.trim().startsWith('q='));
      const quality = qualityParam ? Number.parseFloat(qualityParam.trim().slice(2)) : 1;
      return {
        q: Number.isFinite(quality) ? quality : 0,
        type: type.trim().toLowerCase(),
      };
    })
    .filter(entry => entry.type.length > 0);

  return entries.length > 0 ? entries : [{ q: 1, type: '*/*' }];
}

function qualityFor(accept: AcceptEntry[], mediaType: string) {
  const [wantedType, wantedSubtype] = mediaType.split('/');
  let best = 0;

  for (const entry of accept) {
    const [type, subtype] = entry.type.split('/');
    const typeMatches = type === wantedType || type === '*';
    const subtypeMatches = subtype === wantedSubtype || subtype === '*';
    if (typeMatches && subtypeMatches) {
      best = Math.max(best, entry.q);
    }
  }

  return best;
}

function hasExplicitType(accept: AcceptEntry[], mediaType: string) {
  return accept.some(entry => entry.type === mediaType && entry.q > 0);
}

export function selectRepresentation(header: null | string): Representation {
  const accept = parseAccept(header);
  const markdownQuality = qualityFor(accept, 'text/markdown');
  const htmlQuality = qualityFor(accept, 'text/html');

  if (markdownQuality === 0 && htmlQuality === 0) {
    return 'none';
  }

  if (hasExplicitType(accept, 'text/markdown') && markdownQuality >= htmlQuality) {
    return 'markdown';
  }

  return 'html';
}

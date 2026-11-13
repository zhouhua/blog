import { describe, expect, it } from 'vitest';
import { isArticlePath, selectRepresentation } from './negotiate-markdown';

describe('selectRepresentation', () => {
  it('keeps html when the client does not ask for markdown', () => {
    expect(selectRepresentation(null)).toBe('html');
    expect(selectRepresentation('text/html')).toBe('html');
    expect(selectRepresentation('*/*')).toBe('html');
    expect(selectRepresentation('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')).toBe('html');
  });

  it('keeps html when markdown is only a lower-quality fallback', () => {
    expect(selectRepresentation('text/html, text/markdown;q=0.5')).toBe('html');
  });

  it('returns markdown when it is explicitly requested at least as much as html', () => {
    expect(selectRepresentation('text/markdown')).toBe('markdown');
    expect(selectRepresentation('text/markdown, text/html;q=0.9')).toBe('markdown');
    expect(selectRepresentation('text/markdown;q=0.8, text/html;q=0.8')).toBe('markdown');
  });

  it('returns none when neither representation is acceptable', () => {
    expect(selectRepresentation('application/json')).toBe('none');
    expect(selectRepresentation('text/html;q=0, text/markdown;q=0')).toBe('none');
  });
});

describe('isArticlePath', () => {
  it('matches blog posts and skips other routes', () => {
    expect(isArticlePath('/2026/llm-site-visibility')).toBe(true);
    expect(isArticlePath('/2026/llm-site-visibility.md')).toBe(false);
    expect(isArticlePath('/journals')).toBe(false);
    expect(isArticlePath('/about')).toBe(false);
    expect(isArticlePath('/2026/llm-site-visibility/')).toBe(false);
  });
});

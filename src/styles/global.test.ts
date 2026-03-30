import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const globalCss = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf8');

describe('global theme tokens', () => {
  it('defines the semantic shadcn tokens used by project UI components', () => {
    [
      '--color-popover',
      '--color-popover-foreground',
      '--color-card-foreground',
      '--color-primary-foreground',
      '--color-secondary-foreground',
      '--color-muted',
      '--color-muted-foreground',
      '--color-accent-foreground',
      '--color-destructive',
      '--color-destructive-foreground',
    ].forEach((token) => {
      expect(globalCss).toContain(token);
    });
  });

  it('does not force form controls to inherit text color from surrounding layout', () => {
    expect(globalCss).not.toContain(`button,
input,
select,
textarea {
  color: inherit;`);
  });
});

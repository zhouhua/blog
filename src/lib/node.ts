import { stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export async function getRoot() {
  let cur = import.meta.url;
  while (true) {
    try {
      const stats = await stat(join(cur, 'package.json'));
      if (stats) {
        return cur;
      }
      else {
        cur = dirname(cur);
      }
    }
    catch (e) {
      cur = dirname(cur);
    }
  }
}

import { registerPlugin } from '@capacitor/core';

import type { CapacitorMMKVPlugin } from './definitions';

const CapacitorMMKV = registerPlugin<CapacitorMMKVPlugin>('CapacitorMMKV', {
  web: () => import('./web').then((m) => new m.CapacitorMMKVWeb()),
});

export * from './definitions';
export { CapacitorMMKV };

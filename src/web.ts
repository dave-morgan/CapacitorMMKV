import { WebPlugin } from '@capacitor/core';

import type { CapacitorMMKVPlugin } from './definitions';

export class CapacitorMMKVWeb extends WebPlugin implements CapacitorMMKVPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}

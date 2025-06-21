import { registerPlugin } from '@capacitor/core';

import type { CapacitorMMKVPlugin, MMKVLogEvent } from './definitions';
import { MMKVLogLevel } from './definitions';

const CapacitorMMKV = registerPlugin<CapacitorMMKVPlugin>('CapacitorMMKV', {
  web: () => import('./web').then((m) => new m.CapacitorMMKVWeb()),
});

// Convenience wrapper for setting up logging
export class MMKVLogger {
  private static listener: ((event: MMKVLogEvent) => void) | null = null;

  static async enableLogging(level: MMKVLogLevel = MMKVLogLevel.Info, callback?: (event: MMKVLogEvent) => void): Promise<void> {
    await CapacitorMMKV.setLogLevel({ level });
    
    if (callback) {
      this.listener = callback;
      await CapacitorMMKV.addListener('mmkvLog', this.listener);
    }
  }

  static async disableLogging(): Promise<void> {
    await CapacitorMMKV.setLogLevel({ level: MMKVLogLevel.Off });
    
    if (this.listener) {
      await CapacitorMMKV.removeAllListeners();
      this.listener = null;
    }
  }

  static async setLevel(level: MMKVLogLevel): Promise<void> {
    await CapacitorMMKV.setLogLevel({ level });
  }

  static async getLevel(): Promise<MMKVLogLevel> {
    const result = await CapacitorMMKV.getLogLevel();
    return result.level;
  }
}

export * from './definitions';
export { CapacitorMMKV };

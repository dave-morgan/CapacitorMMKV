import { CapacitorMMKV } from '../../index';

import type { 
  WritableSignal, 
  CreateSignal, 
  MMKVSignalOptions, 
  MMKVSignalStore,
  ScopedMMKVSignalStore,
  MMKVStoreScope,
  SerializableValue 
} from './types';

/**
 * Framework-agnostic signal-based MMKV adapter
 * Uses the signal() function from the consuming framework (Angular, etc.)
 */
export class MMKVSignalStoreImpl implements MMKVSignalStore {
  private signalCache = new Map<string, WritableSignal<any>>();
  
  constructor(private createSignal: CreateSignal) {}

  private getCacheKey(key: string, options?: MMKVSignalOptions): string {
    const mmkvId = options?.mmkvId || 'default';
    const namespace = options?.namespace || '';
    return `${mmkvId}:${namespace}:${key}`;
  }

  private async loadValue<T>(key: string, options?: MMKVSignalOptions): Promise<T | null> {
    try {
      const result = await CapacitorMMKV.getString({ 
        key, 
        mmkvId: options?.mmkvId,
        namespace: options?.namespace 
      });
      
      if (result.value === null) return null;
      
      if (options?.deserialize) {
        return options.deserialize(result.value);
      }
      
      return result.value as T;
    } catch (error) {
      console.warn(`Failed to load MMKV value for key ${key}:`, error);
      return null;
    }
  }

  private async saveValue(key: string, value: any, options?: MMKVSignalOptions): Promise<void> {
    try {
      let serializedValue: string;
      
      if (options?.serialize) {
        serializedValue = options.serialize(value);
      } else if (typeof value === 'string') {
        serializedValue = value;
      } else {
        serializedValue = JSON.stringify(value);
      }
      
      await CapacitorMMKV.setString({ 
        key, 
        value: serializedValue,
        mmkvId: options?.mmkvId,
        namespace: options?.namespace 
      });
    } catch (error) {
      console.error(`Failed to save MMKV value for key ${key}:`, error);
    }
  }

  private createMMKVSignal<T>(
    key: string, 
    initialValue: T, 
    options?: MMKVSignalOptions
  ): WritableSignal<T> {
    const cacheKey = this.getCacheKey(key, options);
    
    if (this.signalCache.has(cacheKey)) {
      return this.signalCache.get(cacheKey);
    }

    const signal = this.createSignal(initialValue);
    
    // Load initial value from MMKV
    this.loadValue<T>(key, options).then(loadedValue => {
      if (loadedValue !== null) {
        signal.set(loadedValue);
      }
    });

    // Override set method to sync with MMKV
    const originalSet = signal.set;
    signal.set = (value: T) => {
      originalSet.call(signal, value);
      this.saveValue(key, value, options);
    };

    // Override update method to sync with MMKV
    const originalUpdate = signal.update;
    signal.update = (updateFn: (value: T) => T) => {
      const currentValue = signal();
      const newValue = updateFn(currentValue);
      signal.set(newValue);
    };

    this.signalCache.set(cacheKey, signal);
    return signal;
  }

  getString(key: string, options?: MMKVSignalOptions): WritableSignal<string | null> {
    return this.createMMKVSignal<string | null>(key, options?.defaultValue || null, options);
  }

  getInt(key: string, options?: MMKVSignalOptions): WritableSignal<number | null> {
    const intOptions = {
      ...options,
      deserialize: (value: string) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
      },
      serialize: (value: number | null) => value?.toString() || ''
    };
    return this.createMMKVSignal<number | null>(key, options?.defaultValue || null, intOptions);
  }

  getBool(key: string, options?: MMKVSignalOptions): WritableSignal<boolean | null> {
    const boolOptions = {
      ...options,
      deserialize: (value: string) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return null;
      },
      serialize: (value: boolean | null) => value?.toString() || ''
    };
    return this.createMMKVSignal<boolean | null>(key, options?.defaultValue || null, boolOptions);
  }

  getFloat(key: string, options?: MMKVSignalOptions): WritableSignal<number | null> {
    const floatOptions = {
      ...options,
      deserialize: (value: string) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      },
      serialize: (value: number | null) => value?.toString() || ''
    };
    return this.createMMKVSignal<number | null>(key, options?.defaultValue || null, floatOptions);
  }

  getObject<T extends SerializableValue>(key: string, options?: MMKVSignalOptions): WritableSignal<T | null> {
    const objectOptions = {
      ...options,
      deserialize: (value: string) => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      },
      serialize: (value: T | null) => JSON.stringify(value)
    };
    return this.createMMKVSignal<T | null>(key, options?.defaultValue || null, objectOptions);
  }

  // Convenience methods with default values
  getStringWithDefault(key: string, defaultValue: string, options?: MMKVSignalOptions): WritableSignal<string> {
    const signal = this.createMMKVSignal<string>(key, defaultValue, options);
    
    // Ensure we never return null by providing fallback
    const originalSignal = signal();
    if (originalSignal === null) {
      signal.set(defaultValue);
    }
    
    return signal as WritableSignal<string>;
  }

  getIntWithDefault(key: string, defaultValue: number, options?: MMKVSignalOptions): WritableSignal<number> {
    const intOptions = {
      ...options,
      deserialize: (value: string) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
      },
      serialize: (value: number) => value.toString()
    };
    return this.createMMKVSignal<number>(key, defaultValue, intOptions);
  }

  getBoolWithDefault(key: string, defaultValue: boolean, options?: MMKVSignalOptions): WritableSignal<boolean> {
    const boolOptions = {
      ...options,
      deserialize: (value: string) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return defaultValue;
      },
      serialize: (value: boolean) => value.toString()
    };
    return this.createMMKVSignal<boolean>(key, defaultValue, boolOptions);
  }

  getFloatWithDefault(key: string, defaultValue: number, options?: MMKVSignalOptions): WritableSignal<number> {
    const floatOptions = {
      ...options,
      deserialize: (value: string) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
      },
      serialize: (value: number) => value.toString()
    };
    return this.createMMKVSignal<number>(key, defaultValue, floatOptions);
  }

  getObjectWithDefault<T extends SerializableValue>(
    key: string, 
    defaultValue: T, 
    options?: MMKVSignalOptions
  ): WritableSignal<T> {
    const objectOptions = {
      ...options,
      deserialize: (value: string) => {
        try {
          return JSON.parse(value);
        } catch {
          return defaultValue;
        }
      },
      serialize: (value: T) => JSON.stringify(value)
    };
    return this.createMMKVSignal<T>(key, defaultValue, objectOptions);
  }

  /**
   * Clear the signal cache and optionally reload from MMKV
   */
  clearCache(): void {
    this.signalCache.clear();
  }

  /**
   * Manually sync a signal with MMKV (useful for external updates)
   */
  async syncSignal<T>(key: string, options?: MMKVSignalOptions): Promise<void> {
    const cacheKey = this.getCacheKey(key, options);
    const signal = this.signalCache.get(cacheKey);
    
    if (signal) {
      const loadedValue = await this.loadValue<T>(key, options);
      if (loadedValue !== null) {
        signal.set(loadedValue);
      }
    }
  }
}

/**
 * Scoped MMKV signal store that automatically applies mmkvId and namespace to all operations
 */
export class ScopedMMKVSignalStoreImpl implements ScopedMMKVSignalStore {
  constructor(
    private baseStore: MMKVSignalStore,
    private scope: MMKVStoreScope
  ) {}

  private getOptions(additionalOptions?: Partial<MMKVSignalOptions>): MMKVSignalOptions {
    return {
      ...additionalOptions,
      mmkvId: this.scope.mmkvId,
      namespace: this.scope.namespace
    };
  }

  getString(key: string): WritableSignal<string | null> {
    return this.baseStore.getString(key, this.getOptions());
  }

  getInt(key: string): WritableSignal<number | null> {
    return this.baseStore.getInt(key, this.getOptions());
  }

  getBool(key: string): WritableSignal<boolean | null> {
    return this.baseStore.getBool(key, this.getOptions());
  }

  getFloat(key: string): WritableSignal<number | null> {
    return this.baseStore.getFloat(key, this.getOptions());
  }

  getObject<T extends SerializableValue>(key: string): WritableSignal<T | null> {
    return this.baseStore.getObject<T>(key, this.getOptions());
  }

  getStringWithDefault(key: string, defaultValue: string): WritableSignal<string> {
    return this.baseStore.getStringWithDefault(key, defaultValue, this.getOptions());
  }

  getIntWithDefault(key: string, defaultValue: number): WritableSignal<number> {
    return this.baseStore.getIntWithDefault(key, defaultValue, this.getOptions());
  }

  getBoolWithDefault(key: string, defaultValue: boolean): WritableSignal<boolean> {
    return this.baseStore.getBoolWithDefault(key, defaultValue, this.getOptions());
  }

  getFloatWithDefault(key: string, defaultValue: number): WritableSignal<number> {
    return this.baseStore.getFloatWithDefault(key, defaultValue, this.getOptions());
  }

  getObjectWithDefault<T extends SerializableValue>(key: string, defaultValue: T): WritableSignal<T> {
    return this.baseStore.getObjectWithDefault<T>(key, defaultValue, this.getOptions());
  }
}

/**
 * Factory function to create MMKV signal store
 * Usage: const store = createMMKVSignalStore(signal); // Pass Angular's signal function
 */
export function createMMKVSignalStore(signalFactory: CreateSignal): MMKVSignalStore {
  return new MMKVSignalStoreImpl(signalFactory);
}

/**
 * Factory function to create scoped MMKV signal store
 * Usage: const store = createScopedMMKVSignalStore(baseStore, { mmkvId: 'auth', namespace: 'user' });
 */
export function createScopedMMKVSignalStore(
  baseStore: MMKVSignalStore, 
  scope: MMKVStoreScope
): ScopedMMKVSignalStore {
  return new ScopedMMKVSignalStoreImpl(baseStore, scope);
}
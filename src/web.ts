import { WebPlugin } from '@capacitor/core';

import type { CapacitorMMKVPlugin, MMKVLogEvent } from './definitions';
import { MMKVLogLevel } from './definitions';

export class CapacitorMMKVWeb extends WebPlugin implements CapacitorMMKVPlugin {
  async setString(_options: { key: string; value: string; mmkvId?: string; namespace?: string }): Promise<void> {
    console.warn('CapacitorMMKV.setString is not available on web');
  }

  async getString(_options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ value: string | null }> {
    console.warn('CapacitorMMKV.getString is not available on web');
    return { value: null };
  }

  async setInt(_options: { key: string; value: number; mmkvId?: string; namespace?: string }): Promise<void> {
    console.warn('CapacitorMMKV.setInt is not available on web');
  }

  async getInt(_options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ value: number | null }> {
    console.warn('CapacitorMMKV.getInt is not available on web');
    return { value: null };
  }

  async setBool(_options: { key: string; value: boolean; mmkvId?: string; namespace?: string }): Promise<void> {
    console.warn('CapacitorMMKV.setBool is not available on web');
  }

  async getBool(_options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ value: boolean | null }> {
    console.warn('CapacitorMMKV.getBool is not available on web');
    return { value: null };
  }

  async setFloat(_options: { key: string; value: number; mmkvId?: string; namespace?: string }): Promise<void> {
    console.warn('CapacitorMMKV.setFloat is not available on web');
  }

  async getFloat(_options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ value: number | null }> {
    console.warn('CapacitorMMKV.getFloat is not available on web');
    return { value: null };
  }

  async setBytes(_options: { key: string; value: Uint8Array; mmkvId?: string; namespace?: string }): Promise<void> {
    console.warn('CapacitorMMKV.setBytes is not available on web');
  }

  async getBytes(_options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ value: Uint8Array | null }> {
    console.warn('CapacitorMMKV.getBytes is not available on web');
    return { value: null };
  }

  async removeValueForKey(_options: { key: string; mmkvId?: string; namespace?: string }): Promise<void> {
    console.warn('CapacitorMMKV.removeValueForKey is not available on web');
  }

  async removeValuesForKeys(_options: { keys: string[]; mmkvId?: string; namespace?: string }): Promise<void> {
    console.warn('CapacitorMMKV.removeValuesForKeys is not available on web');
  }

  async getAllKeys(_options?: { mmkvId?: string; namespace?: string }): Promise<{ keys: string[] }> {
    console.warn('CapacitorMMKV.getAllKeys is not available on web');
    return { keys: [] };
  }

  async contains(_options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ exists: boolean }> {
    console.warn('CapacitorMMKV.contains is not available on web');
    return { exists: false };
  }

  async count(_options?: { mmkvId?: string; namespace?: string }): Promise<{ count: number }> {
    console.warn('CapacitorMMKV.count is not available on web');
    return { count: 0 };
  }

  async totalSize(_options?: { mmkvId?: string; namespace?: string }): Promise<{ size: number }> {
    console.warn('CapacitorMMKV.totalSize is not available on web');
    return { size: 0 };
  }

  async clearAll(_options?: { mmkvId?: string; namespace?: string }): Promise<void> {
    console.warn('CapacitorMMKV.clearAll is not available on web');
  }

  async setLogLevel(_options: { level: MMKVLogLevel }): Promise<void> {
    console.warn('CapacitorMMKV.setLogLevel is not available on web');
  }

  async getLogLevel(): Promise<{ level: MMKVLogLevel }> {
    console.warn('CapacitorMMKV.getLogLevel is not available on web');
    return { level: MMKVLogLevel.Off };
  }

  async addListener(_eventName: 'mmkvLog', _listenerFunc: (event: MMKVLogEvent) => void): Promise<any> {
    console.warn('CapacitorMMKV.addListener is not available on web');
    return Promise.resolve();
  }

  async removeAllListeners(): Promise<void> {
    console.warn('CapacitorMMKV.removeAllListeners is not available on web');
  }
}

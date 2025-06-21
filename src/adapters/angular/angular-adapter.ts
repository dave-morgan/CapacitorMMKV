/**
 * Angular-specific adapter for MMKV signals
 * This file should be imported in Angular projects
 */

import { createMMKVSignalStore, createScopedMMKVSignalStore } from './signal-store';
import type { MMKVSignalStore, ScopedMMKVSignalStore, CreateSignal, MMKVStoreScope } from './types';

// Re-export for convenience
export * from './types';
export { createMMKVSignalStore, createScopedMMKVSignalStore } from './signal-store';

/**
 * Angular-specific implementation that uses Angular's signal() function
 * This will be resolved at runtime when used in an Angular project
 */
let angularSignalStore: MMKVSignalStore | null = null;
const scopedStoreCache = new Map<string, ScopedMMKVSignalStore>();

/**
 * Initialize the Angular MMKV signal store
 * Call this in your Angular app with the signal function from @angular/core
 *
 * @example
 * ```typescript
 * import { signal } from '@angular/core';
 * import { initializeAngularMMKVStore } from '@Davemorgan/mmkv/adapters/angular';
 *
 * // In your app initialization
 * initializeAngularMMKVStore(signal);
 * ```
 */
export function initializeAngularMMKVStore(signalFactory: CreateSignal): MMKVSignalStore {
  angularSignalStore = createMMKVSignalStore(signalFactory);
  return angularSignalStore;
}

/**
 * Get the initialized Angular MMKV signal store with optional scoping
 * @param scope Optional mmkvId and/or namespace to scope all operations
 * @returns Scoped or unscoped store based on parameters
 *
 * @example
 * ```typescript
 * // Global store
 * const globalStore = getAngularMMKVStore();
 *
 * // Auth-scoped store
 * const authStore = getAngularMMKVStore({ mmkvId: 'secure', namespace: 'auth' });
 *
 * // Namespace-only scope
 * const userStore = getAngularMMKVStore({ namespace: 'user' });
 * ```
 */
export function getAngularMMKVStore(): MMKVSignalStore;
export function getAngularMMKVStore(scope: MMKVStoreScope): ScopedMMKVSignalStore;
export function getAngularMMKVStore(scope?: MMKVStoreScope): MMKVSignalStore | ScopedMMKVSignalStore {
  if (!angularSignalStore) {
    throw new Error('Angular MMKV store not initialized. Call initializeAngularMMKVStore(signal) first.');
  }

  // Return base store if no scope provided
  if (!scope || (!scope.mmkvId && !scope.namespace)) {
    return angularSignalStore;
  }

  // Create cache key for scoped store
  const cacheKey = `${scope.mmkvId || 'default'}:${scope.namespace || 'default'}`;

  // Return cached scoped store if exists
  if (scopedStoreCache.has(cacheKey)) {
    return scopedStoreCache.get(cacheKey)!;
  }

  // Create new scoped store and cache it
  const scopedStore = createScopedMMKVSignalStore(angularSignalStore, scope);
  scopedStoreCache.set(cacheKey, scopedStore);

  return scopedStore;
}

/**
 * Angular service-friendly class wrapper with automatic scoping
 * All operations are scoped to the provided mmkvId and/or namespace
 *
 * @example
 * ```typescript
 * // Global scope service
 * class GlobalService extends AngularMMKVService {}
 *
 * // Auth-scoped service
 * class AuthService extends AngularMMKVService {
 *   constructor() { super({ mmkvId: 'secure', namespace: 'auth' }); }
 * }
 *
 * // User-scoped service
 * class UserService extends AngularMMKVService {
 *   constructor() { super({ namespace: 'user' }); }
 * }
 * ```
 */
export class AngularMMKVService {
  private store: MMKVSignalStore | ScopedMMKVSignalStore;

  constructor(scope?: MMKVStoreScope, signalFactory?: CreateSignal) {
    if (signalFactory) {
      const baseStore = createMMKVSignalStore(signalFactory);
      this.store = scope ? createScopedMMKVSignalStore(baseStore, scope) : baseStore;
    } else {
      this.store = scope ? getAngularMMKVStore(scope) : getAngularMMKVStore();
    }
  }

  get mmkvStore(): MMKVSignalStore | ScopedMMKVSignalStore {
    return this.store;
  }

  // Convenience methods that delegate to the store
  getString = this.store.getString.bind(this.store);
  getInt = this.store.getInt.bind(this.store);
  getBool = this.store.getBool.bind(this.store);
  getFloat = this.store.getFloat.bind(this.store);
  getObject = this.store.getObject.bind(this.store);

  getStringWithDefault = this.store.getStringWithDefault.bind(this.store);
  getIntWithDefault = this.store.getIntWithDefault.bind(this.store);
  getBoolWithDefault = this.store.getBoolWithDefault.bind(this.store);
  getFloatWithDefault = this.store.getFloatWithDefault.bind(this.store);
  getObjectWithDefault = this.store.getObjectWithDefault.bind(this.store);
}

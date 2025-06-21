/**
 * Signal-based types using framework-agnostic signal standards
 * Compatible with Angular's signal implementation
 */

export interface Signal<T> {
  (): T;
}

export interface WritableSignal<T> extends Signal<T> {
  set(value: T): void;
  update(updateFn: (value: T) => T): void;
}

export interface CreateSignal {
  <T>(initialValue: T): WritableSignal<T>;
}

export interface MMKVSignalOptions {
  mmkvId?: string;
  namespace?: string;
  defaultValue?: any;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

export interface MMKVSignalConfig<T> extends MMKVSignalOptions {
  key: string;
  initialValue: T;
}

export type SerializableValue = string | number | boolean | object | null;

export interface MMKVSignalStore {
  getString(key: string, options?: MMKVSignalOptions): WritableSignal<string | null>;
  getInt(key: string, options?: MMKVSignalOptions): WritableSignal<number | null>;
  getBool(key: string, options?: MMKVSignalOptions): WritableSignal<boolean | null>;
  getFloat(key: string, options?: MMKVSignalOptions): WritableSignal<number | null>;
  getObject<T extends SerializableValue>(key: string, options?: MMKVSignalOptions): WritableSignal<T | null>;
  
  // Convenience methods with default values
  getStringWithDefault(key: string, defaultValue: string, options?: MMKVSignalOptions): WritableSignal<string>;
  getIntWithDefault(key: string, defaultValue: number, options?: MMKVSignalOptions): WritableSignal<number>;
  getBoolWithDefault(key: string, defaultValue: boolean, options?: MMKVSignalOptions): WritableSignal<boolean>;
  getFloatWithDefault(key: string, defaultValue: number, options?: MMKVSignalOptions): WritableSignal<number>;
  getObjectWithDefault<T extends SerializableValue>(key: string, defaultValue: T, options?: MMKVSignalOptions): WritableSignal<T>;
}

export interface ScopedMMKVSignalStore {
  getString(key: string): WritableSignal<string | null>;
  getInt(key: string): WritableSignal<number | null>;
  getBool(key: string): WritableSignal<boolean | null>;
  getFloat(key: string): WritableSignal<number | null>;
  getObject<T extends SerializableValue>(key: string): WritableSignal<T | null>;
  
  // Convenience methods with default values
  getStringWithDefault(key: string, defaultValue: string): WritableSignal<string>;
  getIntWithDefault(key: string, defaultValue: number): WritableSignal<number>;
  getBoolWithDefault(key: string, defaultValue: boolean): WritableSignal<boolean>;
  getFloatWithDefault(key: string, defaultValue: number): WritableSignal<number>;
  getObjectWithDefault<T extends SerializableValue>(key: string, defaultValue: T): WritableSignal<T>;
}

export interface MMKVStoreScope {
  mmkvId?: string;
  namespace?: string;
}

/**
 * Framework-agnostic observable interface compatible with RxJS
 * Provides a minimal interface that works with Observable libraries
 */
export interface ObservableSubscription {
  unsubscribe(): void;
}

export interface Observer<T> {
  next?: (value: T) => void;
  error?: (error: any) => void;
  complete?: () => void;
}

export interface Observable<T> {
  subscribe(observer: Observer<T>): ObservableSubscription;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): ObservableSubscription;
}

export interface Subject<T> extends Observable<T> {
  next(value: T): void;
  error(error: any): void;
  complete(): void;
}

/**
 * MMKV Logger configuration and interfaces
 */
export interface MMKVLoggerConfig {
  level?: MMKVLogLevel;
  filter?: (event: MMKVLogEvent) => boolean;
}

export interface MMKVLoggerMethods {
  setLevel(level: MMKVLogLevel): Promise<void>;
  getLevel(): Promise<MMKVLogLevel>;
  enableLogging(config?: MMKVLoggerConfig): Promise<void>;
  disableLogging(): Promise<void>;
  isEnabled(): boolean;
}
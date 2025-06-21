export enum MMKVLogLevel {
  Off = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
  Verbose = 5
}

export interface MMKVLogEvent {
  level: MMKVLogLevel;
  message: string;
  timestamp: number;
  mmkvId?: string;
}

export interface CapacitorMMKVPlugin {
  setString(options: { key: string; value: string; mmkvId?: string; namespace?: string }): Promise<void>;
  getString(options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ value: string | null }>;
  setInt(options: { key: string; value: number; mmkvId?: string; namespace?: string }): Promise<void>;
  getInt(options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ value: number | null }>;
  setBool(options: { key: string; value: boolean; mmkvId?: string; namespace?: string }): Promise<void>;
  getBool(options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ value: boolean | null }>;
  setFloat(options: { key: string; value: number; mmkvId?: string; namespace?: string }): Promise<void>;
  getFloat(options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ value: number | null }>;
  setBytes(options: { key: string; value: Uint8Array; mmkvId?: string; namespace?: string }): Promise<void>;
  getBytes(options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ value: Uint8Array | null }>;
  removeValueForKey(options: { key: string; mmkvId?: string; namespace?: string }): Promise<void>;
  removeValuesForKeys(options: { keys: string[]; mmkvId?: string; namespace?: string }): Promise<void>;
  getAllKeys(options?: { mmkvId?: string; namespace?: string }): Promise<{ keys: string[] }>;
  contains(options: { key: string; mmkvId?: string; namespace?: string }): Promise<{ exists: boolean }>;
  count(options?: { mmkvId?: string; namespace?: string }): Promise<{ count: number }>;
  totalSize(options?: { mmkvId?: string; namespace?: string }): Promise<{ size: number }>;
  clearAll(options?: { mmkvId?: string; namespace?: string }): Promise<void>;
  
  setLogLevel(options: { level: MMKVLogLevel }): Promise<void>;
  getLogLevel(): Promise<{ level: MMKVLogLevel }>;
  
  addListener(eventName: 'mmkvLog', listenerFunc: (event: MMKVLogEvent) => void): Promise<any>;
  removeAllListeners(): Promise<void>;
}

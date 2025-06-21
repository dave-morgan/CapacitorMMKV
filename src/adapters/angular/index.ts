/**
 * Angular adapter for MMKV with signal-based state management and reactive logging
 * 
 * This adapter provides a reactive interface to MMKV using signals that are
 * compatible with Angular's signal implementation and other signal libraries.
 * 
 * Features:
 * - Automatic synchronization between signals and MMKV storage
 * - Framework-agnostic signal interface (works with Angular signals)
 * - RxJS-compatible observable logging streams
 * - Type-safe access to different data types
 * - Support for custom serialization/deserialization
 * - Namespace and instance isolation
 * - Caching for performance
 * - Real-time log event streaming
 */

export * from './types';
export * from './signal-store';
export * from './angular-adapter';
export * from './observable';
export * from './logger';

// Re-export main MMKV functionality
export { CapacitorMMKV, MMKVLogger, MMKVLogLevel } from '../../index';
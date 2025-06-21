/**
 * AngularMMKVLogger - Observable-based MMKV logging for Angular applications
 * Provides RxJS-compatible observables for MMKV log events
 */

import type { MMKVLogEvent, MMKVLogLevel } from '../../definitions';
import { CapacitorMMKV } from '../../index';

import { SimpleSubject, fromCapacitorEvent, createObservable } from './observable';
import type { Observable, ObservableSubscription, MMKVLoggerConfig, MMKVLoggerMethods } from './types';

/**
 * Angular-compatible MMKV Logger with Observable streams
 * Provides reactive logging capabilities using framework-agnostic observables
 */
export class AngularMMKVLogger implements MMKVLoggerMethods {
  private logSubject = new SimpleSubject<MMKVLogEvent>();
  private isLoggingEnabled = false;
  private currentLevel: MMKVLogLevel = 0; // Off by default
  private currentFilter?: (event: MMKVLogEvent) => boolean;
  private capacitorSubscription?: any;

  /**
   * Observable stream of all MMKV log events
   * Compatible with RxJS operators and patterns
   */
  readonly logs$: Observable<MMKVLogEvent> = this.logSubject;

  /**
   * Set the logging level
   */
  async setLevel(level: MMKVLogLevel): Promise<void> {
    this.currentLevel = level;
    await CapacitorMMKV.setLogLevel({ level });
  }

  /**
   * Get the current logging level
   */
  async getLevel(): Promise<MMKVLogLevel> {
    const result = await CapacitorMMKV.getLogLevel();
    this.currentLevel = result.level;
    return result.level;
  }

  /**
   * Enable logging with optional configuration
   */
  async enableLogging(config?: MMKVLoggerConfig): Promise<void> {
    if (this.isLoggingEnabled) {
      await this.disableLogging();
    }

    // Set level if provided
    if (config?.level !== undefined) {
      await this.setLevel(config.level);
    }

    // Set filter if provided
    this.currentFilter = config?.filter;

    // Add Capacitor event listener
    this.capacitorSubscription = await CapacitorMMKV.addListener('mmkvLog', (event: MMKVLogEvent) =>
      this.handleLogEvent(event),
    );

    this.isLoggingEnabled = true;
  }

  /**
   * Disable logging and clean up subscriptions
   */
  async disableLogging(): Promise<void> {
    if (!this.isLoggingEnabled) return;

    // Set log level to off
    await this.setLevel(0); // MMKVLogLevel.Off

    // Remove Capacitor event listeners
    await CapacitorMMKV.removeAllListeners();
    this.capacitorSubscription = undefined;

    // Clear filter
    this.currentFilter = undefined;

    this.isLoggingEnabled = false;
  }

  /**
   * Check if logging is currently enabled
   */
  isEnabled(): boolean {
    return this.isLoggingEnabled;
  }

  /**
   * Create a filtered observable stream for specific log levels
   */
  getLogsForLevel(level: MMKVLogLevel): Observable<MMKVLogEvent> {
    return createObservable<MMKVLogEvent>((observer) => {
      const subscription = this.logs$.subscribe({
        next: (event) => {
          if (event.level === level && observer.next) {
            observer.next(event);
          }
        },
        error: observer.error,
        complete: observer.complete,
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Create a filtered observable stream for specific MMKV instances
   */
  getLogsForInstance(mmkvId: string): Observable<MMKVLogEvent> {
    return createObservable<MMKVLogEvent>((observer) => {
      const subscription = this.logs$.subscribe({
        next: (event) => {
          if (event.mmkvId === mmkvId && observer.next) {
            observer.next(event);
          }
        },
        error: observer.error,
        complete: observer.complete,
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Create a filtered observable stream with custom filter function
   */
  getFilteredLogs(filter: (event: MMKVLogEvent) => boolean): Observable<MMKVLogEvent> {
    return createObservable<MMKVLogEvent>((observer) => {
      const subscription = this.logs$.subscribe({
        next: (event) => {
          if (filter(event) && observer.next) {
            observer.next(event);
          }
        },
        error: observer.error,
        complete: observer.complete,
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get error logs only
   */
  get errorLogs$(): Observable<MMKVLogEvent> {
    return this.getLogsForLevel(1); // MMKVLogLevel.Error
  }

  /**
   * Get warning logs only
   */
  get warnLogs$(): Observable<MMKVLogEvent> {
    return this.getLogsForLevel(2); // MMKVLogLevel.Warn
  }

  /**
   * Get info logs only
   */
  get infoLogs$(): Observable<MMKVLogEvent> {
    return this.getLogsForLevel(3); // MMKVLogLevel.Info
  }

  /**
   * Get debug logs only
   */
  get debugLogs$(): Observable<MMKVLogEvent> {
    return this.getLogsForLevel(4); // MMKVLogLevel.Debug
  }

  /**
   * Get verbose logs only
   */
  get verboseLogs$(): Observable<MMKVLogEvent> {
    return this.getLogsForLevel(5); // MMKVLogLevel.Verbose
  }

  /**
   * Handle incoming log events from Capacitor
   */
  private handleLogEvent(event: MMKVLogEvent): void {
    // Apply filter if configured
    if (this.currentFilter && !this.currentFilter(event)) {
      return;
    }

    // Emit to observable stream
    this.logSubject.next(event);
  }

  /**
   * Clean up resources when logger is no longer needed
   */
  async destroy(): Promise<void> {
    await this.disableLogging();
    this.logSubject.complete();
  }
}

/**
 * Singleton instance per Angular app
 * Uses a Map to support multiple Angular apps in the same context
 */
const appLoggers = new Map<string, AngularMMKVLogger>();
let defaultAppId = 'default';

/**
 * Set the current Angular app ID for logger isolation
 * Call this in your Angular app initialization to ensure logger isolation
 *
 * @param appId Unique identifier for your Angular app instance
 *
 * @example
 * ```typescript
 * // In main.ts or app.config.ts
 * import { setAngularAppId } from '@Davemorgan/mmkv/adapters/angular';
 *
 * setAngularAppId('my-app-instance');
 * ```
 */
export function setAngularAppId(appId: string): void {
  defaultAppId = appId;
}

/**
 * Get the current Angular app ID
 */
export function getAngularAppId(): string {
  return defaultAppId;
}

/**
 * Get the AngularMMKVLogger instance for the current Angular app
 * Creates one if it doesn't exist for this app instance
 * Each Angular app gets its own logger singleton
 *
 * @param appId Optional app ID override, defaults to current app
 */
export function getAngularMMKVLogger(appId?: string): AngularMMKVLogger {
  const effectiveAppId = appId || defaultAppId;

  if (!appLoggers.has(effectiveAppId)) {
    appLoggers.set(effectiveAppId, new AngularMMKVLogger());
  }

  return appLoggers.get(effectiveAppId)!;
}

/**
 * Create a new AngularMMKVLogger instance (not singleton)
 * Useful when you need multiple logger instances with different configurations
 * This bypasses the singleton pattern entirely
 */
export function createAngularMMKVLogger(): AngularMMKVLogger {
  return new AngularMMKVLogger();
}

/**
 * Destroy the logger instance for a specific Angular app
 * Useful for cleanup during app teardown or testing
 *
 * @param appId App ID to destroy logger for, defaults to current app
 */
export async function destroyAngularMMKVLogger(appId?: string): Promise<void> {
  const effectiveAppId = appId || defaultAppId;
  const logger = appLoggers.get(effectiveAppId);

  if (logger) {
    await logger.destroy();
    appLoggers.delete(effectiveAppId);
  }
}

/**
 * Destroy all logger instances
 * Useful for complete cleanup or testing scenarios
 */
export async function destroyAllAngularMMKVLoggers(): Promise<void> {
  const destroyPromises = Array.from(appLoggers.values()).map((logger) => logger.destroy());
  await Promise.all(destroyPromises);
  appLoggers.clear();
}

/**
 * Get all active Angular app IDs with logger instances
 * Useful for debugging or monitoring multiple app instances
 */
export function getActiveAngularAppIds(): string[] {
  return Array.from(appLoggers.keys());
}

/**
 * Convenience functions for quick logging setup
 * All functions use the current Angular app's logger singleton
 */
export const AngularMMKVLoggerUtils = {
  /**
   * Quick setup for development logging
   *
   * @param appId Optional app ID override
   */
  async enableDevelopmentLogging(appId?: string): Promise<AngularMMKVLogger> {
    const logger = getAngularMMKVLogger(appId);
    await logger.enableLogging({
      level: 4, // Debug level
      filter: (event) => event.level <= 4, // Filter out verbose logs
    });
    return logger;
  },

  /**
   * Quick setup for production error logging
   *
   * @param appId Optional app ID override
   */
  async enableProductionLogging(appId?: string): Promise<AngularMMKVLogger> {
    const logger = getAngularMMKVLogger(appId);
    await logger.enableLogging({
      level: 1, // Error level only
      filter: (event) => event.level === 1, // Only errors
    });
    return logger;
  },

  /**
   * Setup logging with console output
   *
   * @param level Log level to enable
   * @param appId Optional app ID override
   */
  async enableConsoleLogging(level: MMKVLogLevel = 3, appId?: string): Promise<ObservableSubscription> {
    const logger = getAngularMMKVLogger(appId);
    await logger.enableLogging({ level });

    return logger.logs$.subscribe({
      next: (event) => {
        const levelNames = ['OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'VERBOSE'];
        const levelName = levelNames[event.level] || 'UNKNOWN';
        const instanceInfo = event.mmkvId ? ` [${event.mmkvId}]` : '';
        const appInfo = appId ? ` {${appId}}` : '';
        console.log(`[MMKV ${levelName}]${instanceInfo}${appInfo} ${event.message}`);
      },
      error: (error) => console.error('MMKV Logger error:', error),
    });
  },

  /**
   * Get the logger for the current Angular app
   *
   * @param appId Optional app ID override
   */
  getLogger(appId?: string): AngularMMKVLogger {
    return getAngularMMKVLogger(appId);
  },

  /**
   * Initialize logging for an Angular app with custom configuration
   *
   * @param config Logger configuration
   * @param appId Optional app ID override
   */
  async initializeLogging(config: MMKVLoggerConfig, appId?: string): Promise<AngularMMKVLogger> {
    const logger = getAngularMMKVLogger(appId);
    await logger.enableLogging(config);
    return logger;
  },
};

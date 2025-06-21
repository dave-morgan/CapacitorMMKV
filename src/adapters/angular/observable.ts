/**
 * Framework-agnostic observable implementation compatible with RxJS
 * Provides a minimal Subject implementation that works with any Observable library
 */

import type { Observable, Observer, ObservableSubscription, Subject } from './types';

/**
 * Simple subscription implementation
 */
class SimpleSubscription implements ObservableSubscription {
  private isUnsubscribed = false;

  constructor(private unsubscribeFn: () => void) {}

  unsubscribe(): void {
    if (!this.isUnsubscribed) {
      this.isUnsubscribed = true;
      this.unsubscribeFn();
    }
  }

  get closed(): boolean {
    return this.isUnsubscribed;
  }
}

/**
 * Simple Observable implementation compatible with RxJS interface
 */
export class SimpleObservable<T> implements Observable<T> {
  constructor(private subscribeFn: (observer: Observer<T>) => (() => void) | void) {}

  subscribe(observer: Observer<T>): ObservableSubscription;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): ObservableSubscription;
  subscribe(
    observerOrNext?: Observer<T> | ((value: T) => void),
    error?: (error: any) => void,
    complete?: () => void
  ): ObservableSubscription {
    const observer: Observer<T> = typeof observerOrNext === 'function'
      ? { next: observerOrNext, error, complete }
      : observerOrNext || {};

    const unsubscribeFn = this.subscribeFn(observer);
    
    return new SimpleSubscription(() => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    });
  }
}

/**
 * Simple Subject implementation compatible with RxJS interface
 * Acts as both Observable and Observer
 */
export class SimpleSubject<T> extends SimpleObservable<T> implements Subject<T> {
  private observers: Observer<T>[] = [];
  private isCompleted = false;
  private hasError = false;
  private errorValue: any;

  constructor() {
    super((observer: Observer<T>) => {
      if (this.hasError && observer.error) {
        observer.error(this.errorValue);
        return;
      }

      if (this.isCompleted && observer.complete) {
        observer.complete();
        return;
      }

      this.observers.push(observer);

      // Return unsubscribe function
      return () => {
        const index = this.observers.indexOf(observer);
        if (index >= 0) {
          this.observers.splice(index, 1);
        }
      };
    });
  }

  next(value: T): void {
    if (this.isCompleted || this.hasError) return;

    this.observers.forEach(observer => {
      if (observer.next) {
        try {
          observer.next(value);
        } catch (error) {
          // Handle synchronous errors in observer
          if (observer.error) {
            observer.error(error);
          }
        }
      }
    });
  }

  error(error: any): void {
    if (this.isCompleted || this.hasError) return;

    this.hasError = true;
    this.errorValue = error;

    this.observers.forEach(observer => {
      if (observer.error) {
        try {
          observer.error(error);
        } catch (e) {
          // If error handler throws, log it but don't propagate
          console.error('Error in error handler:', e);
        }
      }
    });

    this.observers.length = 0; // Clear observers after error
  }

  complete(): void {
    if (this.isCompleted || this.hasError) return;

    this.isCompleted = true;

    this.observers.forEach(observer => {
      if (observer.complete) {
        try {
          observer.complete();
        } catch (error) {
          // If complete handler throws, log it but don't propagate
          console.error('Error in complete handler:', error);
        }
      }
    });

    this.observers.length = 0; // Clear observers after completion
  }

  /**
   * Get current observer count (useful for debugging)
   */
  get observerCount(): number {
    return this.observers.length;
  }

  /**
   * Check if subject has been completed or errored
   */
  get isStopped(): boolean {
    return this.isCompleted || this.hasError;
  }
}

/**
 * Create an Observable from a Capacitor event listener
 * Compatible with RxJS and other Observable libraries
 */
export function fromCapacitorEvent<T>(
  addListener: (eventName: string, callback: (event: T) => void) => Promise<any>,
  removeAllListeners: () => Promise<void>,
  eventName: string
): Observable<T> {
  return new SimpleObservable<T>((observer: Observer<T>) => {
    let listenerHandle: any;

    // Add the event listener
    addListener(eventName, (event: T) => {
      if (observer.next) {
        observer.next(event);
      }
    }).then(handle => {
      listenerHandle = handle;
    }).catch(error => {
      if (observer.error) {
        observer.error(error);
      }
    });

    // Return unsubscribe function
    return () => {
      if (listenerHandle) {
        // Note: Individual listener removal not available in current Capacitor API
        // This would remove ALL listeners for this event type
        removeAllListeners().catch(console.error);
      }
    };
  });
}

/**
 * Factory function to create Subject instances
 * Allows for easy swapping with RxJS Subject if needed
 */
export function createSubject<T>(): Subject<T> {
  return new SimpleSubject<T>();
}

/**
 * Factory function to create Observable instances
 */
export function createObservable<T>(
  subscribeFn: (observer: Observer<T>) => (() => void) | void
): Observable<T> {
  return new SimpleObservable<T>(subscribeFn);
}
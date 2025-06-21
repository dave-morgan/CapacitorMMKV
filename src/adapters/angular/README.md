# Angular MMKV Signal Adapter

This adapter provides reactive MMKV storage using Angular signals. It automatically synchronizes signal values with MMKV storage, creating a seamless reactive data persistence layer.

## Installation

```bash
npm install @Davemorgan/mmkv
```

## Quick Start

### 1. Initialize the Store

```typescript
// app.config.ts or main.ts
import { signal } from '@angular/core';
import { initializeAngularMMKVStore } from '@Davemorgan/mmkv/adapters/angular';

// Initialize the global store
initializeAngularMMKVStore(signal);
```

### 2. Use in Components

```typescript
import { Component } from '@angular/core';
import { getAngularMMKVStore } from '@Davemorgan/mmkv/adapters/angular';

@Component({
  selector: 'app-settings',
  template: `
    <div>
      <p>Username: {{ username() }}</p>
      <input [value]="username()" (input)="username.set($event.target.value)" />

      <p>Dark Mode: {{ isDarkMode() }}</p>
      <button (click)="toggleDarkMode()">Toggle Theme</button>

      <p>Settings: {{ JSON.stringify(settings()) }}</p>
    </div>
  `,
})
export class SettingsComponent {
  // Scoped to 'preferences' namespace
  private store = getAngularMMKVStore({ namespace: 'preferences' });

  // Signals that automatically sync with MMKV in the 'preferences' namespace
  username = this.store.getStringWithDefault('username', 'Anonymous');
  isDarkMode = this.store.getBoolWithDefault('darkMode', false);
  settings = this.store.getObjectWithDefault('userSettings', { theme: 'light', lang: 'en' });

  toggleDarkMode() {
    this.isDarkMode.update((current) => !current);
  }
}
```

### 3. Use in Services

```typescript
import { Injectable } from '@angular/core';
import { AngularMMKVService } from '@Davemorgan/mmkv/adapters/angular';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService extends AngularMMKVService {
  constructor() {
    super({ namespace: 'preferences' }); // All operations scoped to 'preferences'
  }

  // All signals automatically use 'preferences' namespace
  readonly theme = this.getBoolWithDefault('darkMode', false);
  readonly language = this.getStringWithDefault('language', 'en');
  readonly fontSize = this.getIntWithDefault('fontSize', 16);
}

@Injectable({ providedIn: 'root' })
export class AuthService extends AngularMMKVService {
  constructor() {
    super({ mmkvId: 'secure', namespace: 'auth' }); // Secure instance + auth namespace
  }

  // All operations automatically use secure instance with auth namespace
  readonly token = this.getStringWithDefault('token', '');
  readonly refreshToken = this.getStringWithDefault('refreshToken', '');
  readonly expiresAt = this.getStringWithDefault('expiresAt', '');
}

@Injectable({ providedIn: 'root' })
export class UserProfileService extends AngularMMKVService {
  constructor() {
    super({ namespace: 'user' }); // Only namespace scoped
  }

  readonly profile = this.getObjectWithDefault('profile', {
    name: '',
    email: '',
    avatar: null,
  });
}
```

## API Reference

### Store Methods

#### Basic Types

- `getString(key, options?)` - Returns `WritableSignal<string | null>`
- `getInt(key, options?)` - Returns `WritableSignal<number | null>`
- `getBool(key, options?)` - Returns `WritableSignal<boolean | null>`
- `getFloat(key, options?)` - Returns `WritableSignal<number | null>`
- `getObject<T>(key, options?)` - Returns `WritableSignal<T | null>`

#### With Default Values

- `getStringWithDefault(key, defaultValue, options?)` - Returns `WritableSignal<string>`
- `getIntWithDefault(key, defaultValue, options?)` - Returns `WritableSignal<number>`
- `getBoolWithDefault(key, defaultValue, options?)` - Returns `WritableSignal<boolean>`
- `getFloatWithDefault(key, defaultValue, options?)` - Returns `WritableSignal<number>`
- `getObjectWithDefault<T>(key, defaultValue, options?)` - Returns `WritableSignal<T>`

### Options

```typescript
interface MMKVSignalOptions {
  mmkvId?: string; // Custom MMKV instance
  namespace?: string; // Key namespace
  defaultValue?: any; // Default value for the signal
  serialize?: (value: any) => string; // Custom serialization
  deserialize?: (value: string) => any; // Custom deserialization
}
```

## Examples

### Multiple Scoped Stores

```typescript
@Component({
  selector: 'app-dashboard',
})
export class DashboardComponent {
  // Different stores for different purposes
  private authStore = getAngularMMKVStore({ mmkvId: 'secure', namespace: 'auth' });
  private userStore = getAngularMMKVStore({ namespace: 'user' });
  private cacheStore = getAngularMMKVStore({ mmkvId: 'cache' });

  // Each store only operates within its scope
  token = this.authStore.getStringWithDefault('token', '');
  profile = this.userStore.getObjectWithDefault('profile', { name: '', email: '' });
  cachedData = this.cacheStore.getObjectWithDefault('dashboard', null);
}
```

### Service-Based Architecture

```typescript
// Each service is automatically scoped
@Injectable({ providedIn: 'root' })
export class AuthService extends AngularMMKVService {
  constructor() {
    super({ mmkvId: 'secure', namespace: 'auth' });
  }

  readonly token = this.getStringWithDefault('token', '');
  readonly user = this.getObjectWithDefault('user', null);
}

@Injectable({ providedIn: 'root' })
export class PreferencesService extends AngularMMKVService {
  constructor() {
    super({ namespace: 'preferences' });
  }

  readonly theme = this.getBoolWithDefault('darkMode', false);
  readonly language = this.getStringWithDefault('language', 'en');
}

@Injectable({ providedIn: 'root' })
export class CacheService extends AngularMMKVService {
  constructor() {
    super({ mmkvId: 'cache' });
  }

  readonly apiCache = this.getObjectWithDefault('api', {});
  readonly imageCache = this.getObjectWithDefault('images', {});
}
```

### Custom Serialization

```typescript
export class DateStorageService extends AngularMMKVService {
  readonly lastLogin = this.store.getObjectWithDefault<Date>('lastLogin', new Date(), {
    serialize: (date: Date) => date.toISOString(),
    deserialize: (str: string) => new Date(str),
  });
}
```

### Reactive Forms Integration

```typescript
@Component({
  template: `
    <form [formGroup]="userForm">
      <input formControlName="name" placeholder="Name" />
      <input formControlName="email" placeholder="Email" />
      <button (click)="save()">Save</button>
    </form>
  `,
})
export class UserFormComponent {
  private store = getAngularMMKVStore();

  userProfile = this.store.getObjectWithDefault('userProfile', { name: '', email: '' });

  userForm = this.fb.group({
    name: [this.userProfile().name],
    email: [this.userProfile().email],
  });

  constructor(private fb: FormBuilder) {
    // Sync form with signal changes
    effect(() => {
      const profile = this.userProfile();
      this.userForm.patchValue(profile, { emitEvent: false });
    });
  }

  save() {
    this.userProfile.set(this.userForm.value);
  }
}
```

## Reactive Logging

The Angular adapter includes `AngularMMKVLogger` for reactive log monitoring using RxJS-compatible observables:

### Basic Logging Setup

```typescript
import {
  setAngularAppId,
  getAngularMMKVLogger,
  AngularMMKVLoggerUtils,
  MMKVLogLevel,
} from '@Davemorgan/mmkv/adapters/angular';

// Initialize in main.ts or app.config.ts
setAngularAppId('my-app-instance');

@Injectable({ providedIn: 'root' })
export class LoggingService {
  // Gets the singleton logger for this Angular app instance
  private logger = getAngularMMKVLogger();

  async initializeLogging() {
    // Enable logging with debug level
    await this.logger.enableLogging({
      level: MMKVLogLevel.Debug,
      filter: (event) => event.level <= MMKVLogLevel.Info, // Filter out debug/verbose
    });

    // Subscribe to all logs
    this.logger.logs$.subscribe((event) => {
      console.log(`[MMKV] ${event.message}`);
    });

    // Subscribe to errors only
    this.logger.errorLogs$.subscribe((event) => {
      console.error('MMKV Error:', event.message);
      // Send to error reporting service
    });
  }
}
```

### Advanced Logging Patterns

```typescript
@Component({
  selector: 'app-debug-panel',
})
export class DebugPanelComponent implements OnInit {
  private logger = getAngularMMKVLogger();
  private destroy$ = new Subject<void>();

  // Observable streams for different log types
  errorLogs$ = this.logger.errorLogs$;
  warnLogs$ = this.logger.warnLogs$;
  infoLogs$ = this.logger.infoLogs$;

  // Filtered logs for specific instances
  authLogs$ = this.logger.getLogsForInstance('secure');
  cacheLogs$ = this.logger.getLogsForInstance('cache');

  ngOnInit() {
    // Enable development logging
    AngularMMKVLoggerUtils.enableDevelopmentLogging();

    // Monitor errors and display notifications
    this.errorLogs$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.showErrorNotification(event.message);
    });

    // Log performance metrics
    this.logger
      .getFilteredLogs((event) => event.message.includes('performance') || event.message.includes('size'))
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.trackPerformanceMetric(event);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Quick Logging Utilities

```typescript
// Development logging with console output
const subscription = await AngularMMKVLoggerUtils.enableConsoleLogging(MMKVLogLevel.Debug);

// Production error-only logging
const logger = await AngularMMKVLoggerUtils.enableProductionLogging();

// Custom filtered logging
const logger = getAngularMMKVLogger();
await logger.enableLogging({
  level: MMKVLogLevel.Info,
  filter: (event) => {
    // Only log events from specific instances
    return event.mmkvId === 'secure' || event.mmkvId === 'critical';
  },
});

// Monitor specific log patterns
logger
  .getFilteredLogs((event) => event.message.includes('error') || event.message.includes('failed'))
  .subscribe((event) => {
    // Handle error patterns
    this.handleCriticalEvent(event);
  });
```

### Angular App Isolation

Each Angular app instance gets its own logger singleton, preventing cross-app interference:

```typescript
// In main.ts or app.config.ts
import { setAngularAppId } from '@Davemorgan/mmkv/adapters/angular';

// Set unique app ID (useful for micro-frontends or multiple app instances)
setAngularAppId('admin-app');

// Throughout the app, all services get the same logger instance
@Injectable({ providedIn: 'root' })
export class AuthService {
  private logger = getAngularMMKVLogger(); // Gets 'admin-app' logger
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private logger = getAngularMMKVLogger(); // Same 'admin-app' logger instance
}

// In testing or cleanup scenarios
import { destroyAngularMMKVLogger } from '@Davemorgan/mmkv/adapters/angular';

afterEach(async () => {
  await destroyAngularMMKVLogger('admin-app'); // Clean up specific app logger
});
```

### Multi-App Environment

```typescript
// App 1 setup
setAngularAppId('main-app');
const mainLogger = getAngularMMKVLogger();
await mainLogger.enableLogging({ level: MMKVLogLevel.Info });

// App 2 setup (different instance)
setAngularAppId('admin-panel');
const adminLogger = getAngularMMKVLogger();
await adminLogger.enableLogging({ level: MMKVLogLevel.Debug });

// Each app has its own isolated logger
mainLogger !== adminLogger; // true

// Cross-app access if needed
const specificLogger = getAngularMMKVLogger('main-app');
```

## Performance Considerations

- **Caching**: Signals are cached to avoid recreating them
- **Lazy Loading**: MMKV values are loaded asynchronously on first access
- **Batched Updates**: Use `signal.update()` for multiple changes
- **Memory Management**: Call `store.clearCache()` if needed

## Framework Agnostic

The core signal store is framework-agnostic and can work with any signal implementation:

```typescript
import { createMMKVSignalStore } from '@Davemorgan/mmkv/adapters/angular';

// Works with any signal library
const store = createMMKVSignalStore(yourSignalFactory);
```

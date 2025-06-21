# @Davemorgan/mmkv

A Capacitor plugin for MMKV - Ultra-fast key-value storage for mobile apps

## Install

```bash
npm install @Davemorgan/mmkv
npx cap sync
```

## Features

- **Ultra-fast performance**: Based on Tencent's MMKV library
- **Multiple data types**: String, Int, Bool, Float, and Bytes
- **Custom instances**: Use `mmkvId` to create separate storage instances
- **Namespacing**: Organize data with `namespace` parameter
- **Angular Signal Integration**: Reactive signals that auto-sync with MMKV
- **Configurable Logging**: Real-time logging with customizable levels
- **Cross-platform**: Works on iOS and Android

## Usage

### Basic Operations

```typescript
import { CapacitorMMKV } from '@Davemorgan/mmkv';

// Store values
await CapacitorMMKV.setString({ key: 'username', value: 'john_doe' });
await CapacitorMMKV.setInt({ key: 'age', value: 25 });
await CapacitorMMKV.setBool({ key: 'isActive', value: true });
await CapacitorMMKV.setFloat({ key: 'score', value: 98.5 });

// Retrieve values
const username = await CapacitorMMKV.getString({ key: 'username' });
const age = await CapacitorMMKV.getInt({ key: 'age' });
const isActive = await CapacitorMMKV.getBool({ key: 'isActive' });
const score = await CapacitorMMKV.getFloat({ key: 'score' });

console.log(username.value); // 'john_doe'
console.log(age.value); // 25
console.log(isActive.value); // true
console.log(score.value); // 98.5
```

### Angular Signal Integration

For Angular applications, use the reactive signal adapter:

```typescript
import { signal } from '@angular/core';
import { initializeAngularMMKVStore, getAngularMMKVStore } from '@Davemorgan/mmkv/adapters/angular';

// Initialize once in your app
initializeAngularMMKVStore(signal);

// Use scoped stores for automatic namespacing
const userStore = getAngularMMKVStore({ namespace: 'user' });
const authStore = getAngularMMKVStore({ mmkvId: 'secure', namespace: 'auth' });

// Reactive signals that auto-sync with MMKV
const username = userStore.getStringWithDefault('name', 'Anonymous');
const token = authStore.getStringWithDefault('token', '');

// Changes automatically persist to MMKV
username.set('John Doe');
```

### Custom Instances with `mmkvId`

Use `mmkvId` to create separate storage instances for different purposes:

```typescript
// Default instance
await CapacitorMMKV.setString({ key: 'user', value: 'John' });

// Auth instance
await CapacitorMMKV.setString({
  key: 'token',
  value: 'abc123',
  mmkvId: 'auth',
});

// Cache instance
await CapacitorMMKV.setString({
  key: 'data',
  value: 'cached_data',
  mmkvId: 'cache',
});

// Each instance maintains separate storage
const defaultUser = await CapacitorMMKV.getString({ key: 'user' });
const authToken = await CapacitorMMKV.getString({ key: 'token', mmkvId: 'auth' });
```

### Namespacing

Use `namespace` to organize data within the same instance:

```typescript
// User preferences
await CapacitorMMKV.setString({
  key: 'theme',
  value: 'dark',
  namespace: 'preferences',
});

// User profile
await CapacitorMMKV.setString({
  key: 'name',
  value: 'John',
  namespace: 'profile',
});

// App settings
await CapacitorMMKV.setBool({
  key: 'notifications',
  value: true,
  namespace: 'settings',
});
```

### Combined Usage

You can use both `mmkvId` and `namespace` together:

```typescript
// Secure storage with user-specific namespace
await CapacitorMMKV.setString({
  key: 'token',
  value: 'secure_token',
  mmkvId: 'secure',
  namespace: 'user_123',
});

// Different user, same secure instance
await CapacitorMMKV.setString({
  key: 'token',
  value: 'another_token',
  mmkvId: 'secure',
  namespace: 'user_456',
});
```

### Logging and Debugging

Configure MMKV logging with customizable levels:

```typescript
import { MMKVLogger, MMKVLogLevel } from '@Davemorgan/mmkv';

// Enable logging with callback
await MMKVLogger.enableLogging(MMKVLogLevel.Debug, (event) => {
  console.log(`[MMKV ${event.level}] ${event.message}`);
  if (event.mmkvId) console.log(`Instance: ${event.mmkvId}`);
});

// Set specific log level
await MMKVLogger.setLevel(MMKVLogLevel.Error);

// Disable logging
await MMKVLogger.disableLogging();

// Manual event listener
await CapacitorMMKV.addListener('mmkvLog', (event) => {
  console.log(`MMKV: ${event.message} at ${event.timestamp}`);
});
```

### Utility Methods

```typescript
// Check if key exists
const exists = await CapacitorMMKV.contains({ key: 'username' });

// Get all keys (optionally filtered by namespace)
const allKeys = await CapacitorMMKV.getAllKeys();
const userKeys = await CapacitorMMKV.getAllKeys({ namespace: 'user' });

// Count keys
const totalCount = await CapacitorMMKV.count();
const userCount = await CapacitorMMKV.count({ namespace: 'user' });

// Get storage size
const size = await CapacitorMMKV.totalSize();

// Remove specific keys
await CapacitorMMKV.removeValueForKey({ key: 'username' });
await CapacitorMMKV.removeValuesForKeys({ keys: ['key1', 'key2'] });

// Clear all data (optionally by namespace)
await CapacitorMMKV.clearAll(); // Clears everything
await CapacitorMMKV.clearAll({ namespace: 'user' }); // Clears only user namespace
```

## API Reference

### Data Types

- `setString(options)` / `getString(options)` - String values
- `setInt(options)` / `getInt(options)` - Integer values
- `setBool(options)` / `getBool(options)` - Boolean values
- `setFloat(options)` / `getFloat(options)` - Float values
- `setBytes(options)` / `getBytes(options)` - Byte array values

### Options

All methods support these optional parameters:

| Parameter   | Type     | Description                        |
| ----------- | -------- | ---------------------------------- |
| `mmkvId`    | `string` | Custom storage instance identifier |
| `namespace` | `string` | Namespace for organizing keys      |

### Logging Levels

| Level     | Value | Description                |
| --------- | ----- | -------------------------- |
| `Off`     | 0     | No logging (default)       |
| `Error`   | 1     | Error messages only        |
| `Warn`    | 2     | Warning and error messages |
| `Info`    | 3     | Informational messages     |
| `Debug`   | 4     | Debug information          |
| `Verbose` | 5     | All log messages           |

## Framework Integrations

### Angular

The Angular adapter provides reactive signal integration:

```typescript
// See full documentation at: src/adapters/angular/README.md
import { AngularMMKVService } from '@Davemorgan/mmkv/adapters/angular';

@Injectable()
export class UserService extends AngularMMKVService {
  constructor() {
    super({ namespace: 'user' });
  }

  readonly profile = this.getObjectWithDefault('profile', { name: '', email: '' });
  readonly preferences = this.getBoolWithDefault('darkMode', false);
}
```

## Architecture

- **Default Instance**: When no `mmkvId` is specified, uses MMKV's default instance
- **Custom Instances**: Each `mmkvId` creates a separate MMKV storage file
- **Namespacing**: Keys are prefixed with `namespace:` for organization
- **Thread Safety**: Uses concurrent data structures for safe multi-threading
- **Event-Driven Logging**: Real-time log events pushed to JavaScript listeners
- **Signal Synchronization**: Automatic bidirectional sync between signals and MMKV

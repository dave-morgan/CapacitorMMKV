package com.Davemorgan.capacitor.plugins.mmkv;

import android.util.Log;
import com.tencent.mmkv.MMKV;
import com.tencent.mmkv.MMKVLogLevel;
import com.getcapacitor.JSObject;
import java.util.concurrent.ConcurrentHashMap;

public class CapacitorMMKV {

    public interface MMKVLogListener {
        void onLog(int level, String message, String mmkvId);
    }

    private MMKV defaultMMKV;
    private ConcurrentHashMap<String, MMKV> mmkvInstances = new ConcurrentHashMap<>();
    private MMKVLogListener logListener;
    private int currentLogLevel = MMKVLogLevel.LevelNone; // Default to off

    public CapacitorMMKV() {
        // Initialization will be handled by the plugin's load() method
    }

    public void initialize() {
        if (defaultMMKV == null) {
            MMKV.initialize(null);
            defaultMMKV = MMKV.defaultMMKV();
            setupLogging();
        }
    }

    private void setupLogging() {
        MMKV.registerHandler(new com.tencent.mmkv.MMKVHandler() {
            @Override
            public com.tencent.mmkv.MMKVRecoverStrategic onMMKVCRCCheckFail(String mmapID) {
                logMessage(MMKVLogLevel.LevelError, "CRC check failed for: " + mmapID, mmapID);
                return com.tencent.mmkv.MMKVRecoverStrategic.OnErrorRecover;
            }

            @Override
            public com.tencent.mmkv.MMKVRecoverStrategic onMMKVFileLengthError(String mmapID) {
                logMessage(MMKVLogLevel.LevelError, "File length error for: " + mmapID, mmapID);
                return com.tencent.mmkv.MMKVRecoverStrategic.OnErrorRecover;
            }

            @Override
            public boolean wantLogRedirecting() {
                return true;
            }

            @Override
            public void mmkvLog(com.tencent.mmkv.MMKVLogLevel level, String file, int line, String funcname, String message) {
                logMessage(level.ordinal(), message, null);
            }
        });
        
        MMKV.setLogLevel(MMKVLogLevel.LevelNone);
    }

    private void logMessage(int level, String message, String mmkvId) {
        if (level <= currentLogLevel && logListener != null) {
            logListener.onLog(level, message, mmkvId);
        }
    }

    public void setLogListener(MMKVLogListener listener) {
        this.logListener = listener;
    }

    public void setLogLevel(int level) {
        this.currentLogLevel = level;
        MMKV.setLogLevel(convertToMMKVLogLevel(level));
    }

    public int getLogLevel() {
        return currentLogLevel;
    }

    private MMKVLogLevel convertToMMKVLogLevel(int level) {
        switch (level) {
            case 0: return MMKVLogLevel.LevelNone;
            case 1: return MMKVLogLevel.LevelError;
            case 2: return MMKVLogLevel.LevelInfo;
            case 3: return MMKVLogLevel.LevelInfo;
            case 4: return MMKVLogLevel.LevelDebug;
            case 5: return MMKVLogLevel.LevelDebug;
            default: return MMKVLogLevel.LevelNone;
        }
    }

    private MMKV getMMKVInstance(String mmkvId) {
        if (mmkvId == null || mmkvId.isEmpty()) {
            return defaultMMKV;
        }
        
        return mmkvInstances.computeIfAbsent(mmkvId, id -> MMKV.mmkvWithID(id));
    }

    private String getNamespacedKey(String key, String namespace) {
        if (namespace == null || namespace.isEmpty()) {
            return key;
        }
        return namespace + ":" + key;
    }

    public void setString(String key, String value, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        getMMKVInstance(mmkvId).encode(namespacedKey, value);
    }

    public String getString(String key, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        return getMMKVInstance(mmkvId).decodeString(namespacedKey, null);
    }

    public void setInt(String key, int value, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        getMMKVInstance(mmkvId).encode(namespacedKey, value);
    }

    public Integer getInt(String key, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        MMKV instance = getMMKVInstance(mmkvId);
        if (!instance.containsKey(namespacedKey)) {
            return null;
        }
        return instance.decodeInt(namespacedKey, 0);
    }

    public void setBool(String key, boolean value, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        getMMKVInstance(mmkvId).encode(namespacedKey, value);
    }

    public Boolean getBool(String key, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        MMKV instance = getMMKVInstance(mmkvId);
        if (!instance.containsKey(namespacedKey)) {
            return null;
        }
        return instance.decodeBool(namespacedKey, false);
    }

    public void setFloat(String key, float value, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        getMMKVInstance(mmkvId).encode(namespacedKey, value);
    }

    public Float getFloat(String key, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        MMKV instance = getMMKVInstance(mmkvId);
        if (!instance.containsKey(namespacedKey)) {
            return null;
        }
        return instance.decodeFloat(namespacedKey, 0.0f);
    }

    public void setBytes(String key, byte[] value, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        getMMKVInstance(mmkvId).encode(namespacedKey, value);
    }

    public byte[] getBytes(String key, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        return getMMKVInstance(mmkvId).decodeBytes(namespacedKey, null);
    }

    public void removeValueForKey(String key, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        getMMKVInstance(mmkvId).removeValueForKey(namespacedKey);
    }

    public void removeValuesForKeys(String[] keys, String mmkvId, String namespace) {
        if (namespace == null || namespace.isEmpty()) {
            getMMKVInstance(mmkvId).removeValuesForKeys(keys);
        } else {
            String[] namespacedKeys = new String[keys.length];
            for (int i = 0; i < keys.length; i++) {
                namespacedKeys[i] = getNamespacedKey(keys[i], namespace);
            }
            getMMKVInstance(mmkvId).removeValuesForKeys(namespacedKeys);
        }
    }

    public String[] getAllKeys(String mmkvId, String namespace) {
        String[] allKeys = getMMKVInstance(mmkvId).allKeys();
        if (namespace == null || namespace.isEmpty()) {
            return allKeys;
        }
        
        String prefix = namespace + ":";
        return java.util.Arrays.stream(allKeys)
                .filter(key -> key.startsWith(prefix))
                .map(key -> key.substring(prefix.length()))
                .toArray(String[]::new);
    }

    public boolean contains(String key, String mmkvId, String namespace) {
        String namespacedKey = getNamespacedKey(key, namespace);
        return getMMKVInstance(mmkvId).containsKey(namespacedKey);
    }

    public int count(String mmkvId, String namespace) {
        if (namespace == null || namespace.isEmpty()) {
            return getMMKVInstance(mmkvId).count();
        }
        
        String[] allKeys = getMMKVInstance(mmkvId).allKeys();
        String prefix = namespace + ":";
        return (int) java.util.Arrays.stream(allKeys)
                .filter(key -> key.startsWith(prefix))
                .count();
    }

    public long totalSize(String mmkvId, String namespace) {
        return getMMKVInstance(mmkvId).totalSize();
    }

    public void clearAll(String mmkvId, String namespace) {
        if (namespace == null || namespace.isEmpty()) {
            getMMKVInstance(mmkvId).clearAll();
        } else {
            String[] namespacedKeys = getAllKeys(mmkvId, namespace);
            if (namespacedKeys.length > 0) {
                removeValuesForKeys(namespacedKeys, mmkvId, namespace);
            }
        }
    }
}
package com.davecorp.capacitor.plugins.mmkv;

import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "CapacitorMMKV")
public class CapacitorMMKVPlugin extends Plugin {

    private CapacitorMMKV implementation = new CapacitorMMKV();

    @Override
    public void load() {
        implementation.initialize();
        
        // Set up log listener to send events to JavaScript
        implementation.setLogListener(new CapacitorMMKV.MMKVLogListener() {
            @Override
            public void onLog(int level, String message, String mmkvId) {
                JSObject logEvent = new JSObject();
                logEvent.put("level", level);
                logEvent.put("message", message);
                logEvent.put("timestamp", System.currentTimeMillis());
                if (mmkvId != null) {
                    logEvent.put("mmkvId", mmkvId);
                }
                
                notifyListeners("mmkvLog", logEvent);
            }
        });
    }

    @PluginMethod
    public void setString(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        
        implementation.setString(key, value, mmkvId, namespace);
        call.resolve();
    }

    @PluginMethod
    public void getString(PluginCall call) {
        String key = call.getString("key");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        
        String value = implementation.getString(key, mmkvId, namespace);
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    @PluginMethod
    public void setInt(PluginCall call) {
        String key = call.getString("key");
        Integer value = call.getInt("value");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        if (value == null) {
            call.reject("Value is required");
            return;
        }
        
        implementation.setInt(key, value, mmkvId, namespace);
        call.resolve();
    }

    @PluginMethod
    public void getInt(PluginCall call) {
        String key = call.getString("key");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        
        Integer value = implementation.getInt(key, mmkvId, namespace);
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    @PluginMethod
    public void setBool(PluginCall call) {
        String key = call.getString("key");
        Boolean value = call.getBoolean("value");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        if (value == null) {
            call.reject("Value is required");
            return;
        }
        
        implementation.setBool(key, value, mmkvId, namespace);
        call.resolve();
    }

    @PluginMethod
    public void getBool(PluginCall call) {
        String key = call.getString("key");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        
        Boolean value = implementation.getBool(key, mmkvId, namespace);
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    @PluginMethod
    public void setFloat(PluginCall call) {
        String key = call.getString("key");
        Float value = call.getFloat("value");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        if (value == null) {
            call.reject("Value is required");
            return;
        }
        
        implementation.setFloat(key, value, mmkvId, namespace);
        call.resolve();
    }

    @PluginMethod
    public void getFloat(PluginCall call) {
        String key = call.getString("key");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        
        Float value = implementation.getFloat(key, mmkvId, namespace);
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    @PluginMethod
    public void setBytes(PluginCall call) {
        String key = call.getString("key");
        byte[] value = call.getData("value");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        if (value == null) {
            call.reject("Value is required");
            return;
        }
        
        implementation.setBytes(key, value, mmkvId, namespace);
        call.resolve();
    }

    @PluginMethod
    public void getBytes(PluginCall call) {
        String key = call.getString("key");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        
        byte[] value = implementation.getBytes(key, mmkvId, namespace);
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    @PluginMethod
    public void removeValueForKey(PluginCall call) {
        String key = call.getString("key");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        
        implementation.removeValueForKey(key, mmkvId, namespace);
        call.resolve();
    }

    @PluginMethod
    public void removeValuesForKeys(PluginCall call) {
        JSArray keys = call.getArray("keys");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (keys == null) {
            call.reject("Keys array is required");
            return;
        }
        
        try {
            String[] keyArray = new String[keys.length()];
            for (int i = 0; i < keys.length(); i++) {
                keyArray[i] = keys.getString(i);
            }
            implementation.removeValuesForKeys(keyArray, mmkvId, namespace);
            call.resolve();
        } catch (Exception e) {
            call.reject("Error processing keys array", e);
        }
    }

    @PluginMethod
    public void getAllKeys(PluginCall call) {
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        String[] keys = implementation.getAllKeys(mmkvId, namespace);
        JSObject ret = new JSObject();
        JSArray keysArray = new JSArray();
        for (String key : keys) {
            keysArray.put(key);
        }
        ret.put("keys", keysArray);
        call.resolve(ret);
    }

    @PluginMethod
    public void contains(PluginCall call) {
        String key = call.getString("key");
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        
        if (key == null) {
            call.reject("Key is required");
            return;
        }
        
        boolean exists = implementation.contains(key, mmkvId, namespace);
        JSObject ret = new JSObject();
        ret.put("exists", exists);
        call.resolve(ret);
    }

    @PluginMethod
    public void count(PluginCall call) {
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        int count = implementation.count(mmkvId, namespace);
        JSObject ret = new JSObject();
        ret.put("count", count);
        call.resolve(ret);
    }

    @PluginMethod
    public void totalSize(PluginCall call) {
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        long size = implementation.totalSize(mmkvId, namespace);
        JSObject ret = new JSObject();
        ret.put("size", size);
        call.resolve(ret);
    }

    @PluginMethod
    public void clearAll(PluginCall call) {
        String mmkvId = call.getString("mmkvId");
        String namespace = call.getString("namespace");
        implementation.clearAll(mmkvId, namespace);
        call.resolve();
    }

    @PluginMethod
    public void setLogLevel(PluginCall call) {
        Integer level = call.getInt("level");
        
        if (level == null) {
            call.reject("Log level is required");
            return;
        }
        
        implementation.setLogLevel(level);
        call.resolve();
    }

    @PluginMethod
    public void getLogLevel(PluginCall call) {
        int level = implementation.getLogLevel();
        JSObject ret = new JSObject();
        ret.put("level", level);
        call.resolve(ret);
    }
}

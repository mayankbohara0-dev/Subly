// TrialGuard — Robust SecureStore adapter for Supabase & Local State
// Replaces AsyncStorage which is broken in Expo Go SDK 53+.
// Features:
// 1. Key sanitization (Android Keystore requires alphanumeric, '.', '-', '_')
// 2. Chunking (Android SecureStore has a 2048-byte limit per key)
// 3. Web & Memory fallback (so web or unexpected native issues never crash)

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1800; // safe under 2048-byte limit
const CHUNK_COUNT_SUFFIX = '_chunks';

// In-memory fallback if SecureStore fails
const memoryFallback = new Map<string, string>();

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

function chunkKey(safeKey: string, index: number): string {
  return `${safeKey}_chunk_${index}`;
}

export const ExpoSecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {
        // fallback to memory
      }
      return memoryFallback.get(key) ?? null;
    }

    const safeKey = sanitizeKey(key);
    try {
      // Check if value was stored in chunks
      const countStr = await SecureStore.getItemAsync(safeKey + CHUNK_COUNT_SUFFIX);
      if (countStr) {
        const count = parseInt(countStr, 10);
        const chunks: string[] = [];
        for (let i = 0; i < count; i++) {
          const chunk = await SecureStore.getItemAsync(chunkKey(safeKey, i));
          if (chunk === null) {
            return memoryFallback.get(key) ?? null;
          }
          chunks.push(chunk);
        }
        return chunks.join('');
      }

      // Single-value storage
      const value = await SecureStore.getItemAsync(safeKey);
      if (value !== null) return value;
      return memoryFallback.get(key) ?? null;
    } catch (e) {
      console.warn('[SecureStore] getItem fallback to memory:', e);
      return memoryFallback.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryFallback.set(key, value);

    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch {
        // memory fallback already set
      }
      return;
    }

    const safeKey = sanitizeKey(key);
    try {
      if (value.length <= CHUNK_SIZE) {
        // Store directly — also clear any old chunk markers
        await SecureStore.deleteItemAsync(safeKey + CHUNK_COUNT_SUFFIX).catch(() => {});
        await SecureStore.setItemAsync(safeKey, value);
        return;
      }

      // Split into chunks
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        chunks.push(value.slice(i, i + CHUNK_SIZE));
      }
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(chunkKey(safeKey, i), chunks[i]);
      }
      await SecureStore.setItemAsync(
        safeKey + CHUNK_COUNT_SUFFIX,
        String(chunks.length)
      );
    } catch (e) {
      console.warn('[SecureStore] setItem warning:', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    memoryFallback.delete(key);

    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // memory fallback already cleared
      }
      return;
    }

    const safeKey = sanitizeKey(key);
    try {
      const countStr = await SecureStore.getItemAsync(safeKey + CHUNK_COUNT_SUFFIX);
      if (countStr) {
        const count = parseInt(countStr, 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(chunkKey(safeKey, i)).catch(() => {});
        }
        await SecureStore.deleteItemAsync(safeKey + CHUNK_COUNT_SUFFIX).catch(() => {});
      }
      await SecureStore.deleteItemAsync(safeKey).catch(() => {});
    } catch {
      // ignore
    }
  },
};

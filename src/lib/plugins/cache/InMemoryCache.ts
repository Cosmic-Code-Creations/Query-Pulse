import { CachePlugin } from "../CachePlugin";

/**
 * InMemoryCache is an implementation of the CachePlugin interface that uses a simple in-memory Map as its storage.
 * It provides basic get, set, and delete operations for caching values.
 */
export class InMemoryCache implements CachePlugin {
    // The store is a Map that holds key-value pairs in memory.
    // Keys are strings, and values can be of any type.
    private store = new Map<string, unknown>();

    /**
     * Retrieves a value from the cache associated with the specified key.
     *
     * @typeParam T - The expected type of the returned value.
     * @param key - The unique identifier for the cached value.
     * @returns The value associated with the key, or undefined if the key is not found.
     */
    get<T = unknown>(key: string): T | undefined {
        // Retrieve the value from the Map and cast it to type T.
        return this.store.get(key) as T | undefined;
    }

    /**
     * Stores a key-value pair in the cache.
     *
     * @typeParam T - The type of the value being stored.
     * @param key - The unique identifier for the value.
     * @param value - The value to be stored in the cache.
     */
    set<T = unknown>(key: string, value: T): void {
        // Insert or update the key-value pair in the Map.
        this.store.set(key, value);
    }

    /**
     * Deletes a key-value pair from the cache using the specified key.
     *
     * @param key - The unique identifier for the value to be removed.
     */
    delete(key: string): void {
        // Remove the key-value pair from the Map if it exists.
        this.store.delete(key);
    }
}

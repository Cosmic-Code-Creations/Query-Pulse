// src/lib/plugins/cache/CachePlugin.ts
export interface CachePlugin {
    /**
     * Retrieves cached data for a given key.
     */
    get<T = unknown>(key: string): T | undefined;
    /**
     * Stores data in the cache under the given key.
     */
    set<T = unknown>(key: string, value: T): void;
    /**
     * Deletes a cache entry by key.
     */
    delete(key: string): void;
}

/**
 * Represents a constructable cache plugin.
 */
export interface CachePluginConstructor {
    new(): CachePlugin;
}

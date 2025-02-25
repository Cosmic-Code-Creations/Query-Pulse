/**
 * @module CachePluginLoader
 * This module dynamically loads cache plugin modules, registers them,
 * and provides a factory function to create instances by plugin name.
 */

import type { CachePlugin, CachePluginConstructor } from "../CachePlugin";

/**
 * Dynamically import all .ts files in the current folder (excluding index.ts)
 * using Vite's import.meta.glob function with eager loading.
 *
 * The imported modules are explicitly cast to a record mapping file paths
 * to modules with a default export of type CachePluginConstructor.
 */
const modules = import.meta.glob("./*.ts", { eager: true }) as Record<
    string,
    { default: CachePluginConstructor }
>;

/**
 * A registry mapping plugin names (as defined by their class names)
 * to their corresponding CachePlugin constructors.
 */
const cachePlugins: Record<string, CachePluginConstructor> = {};

// Iterate through each module in the imported modules record.
for (const path in modules) {
    // Skip the index.ts file to avoid processing the current module.
    if (path.endsWith("index.ts")) continue;

    // Retrieve the module's exports.
    const moduleExports = modules[path];

    // If the module has a default export, register it.
    if (moduleExports.default) {
        // Use the class name (e.g., "InMemoryCache") as the key.
        const pluginName = moduleExports.default.name;

        // Map the plugin name to its constructor.
        cachePlugins[pluginName] = moduleExports.default;
    }
}

/**
 * Factory function to create an instance of a cache plugin by its name.
 *
 * @param name - The name of the plugin (e.g., "InMemoryCache").
 * @returns An instance of the cache plugin, or undefined if no matching plugin is found.
 */
export function createCachePlugin(name: string): CachePlugin | undefined {
    // Retrieve the plugin constructor from the registry using the provided name.
    const Plugin = cachePlugins[name];

    // If the plugin exists, instantiate and return it; otherwise, return undefined.
    return Plugin ? new Plugin() : undefined;
}

// Optionally export all discovered plugins for external usage.
export { cachePlugins };

// Re-export everything from the CachePlugin module for convenience.
export * from "../CachePlugin";

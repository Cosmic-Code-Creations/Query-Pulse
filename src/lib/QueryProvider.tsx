import {
    createContext,
    useState,
    ReactNode,
    useRef,
    useEffect,
    useCallback,
} from "react";
import { QueryStore, CachePlugin } from "./types";

/**
 * Props for the QueryProvider component.
 *
 * @property children - The child React nodes that will have access to the query context.
 * @property cache - An optional caching plugin used to store and retrieve query data.
 */
interface QueryProviderProps {
    children: ReactNode;
    cache?: CachePlugin;
}

/**
 * The shape of the context value for query state management.
 *
 * @remarks
 * Provides the current query store state and a function to asynchronously fetch data.
 */
const QueryContext = createContext<
    | {
        queryStore: QueryStore;
        /**
         * Initiates an asynchronous fetch for the specified query key and updates the query state.
         *
         * @param key - The unique key representing the query.
         * @param fetchFn - A function returning a promise that resolves with an object containing the data.
         */
        fetchData: (key: string, fetchFn: () => Promise<{ data: unknown }>) => void;
    }
    | undefined
>(undefined);

/**
 * Provides a React context for managing asynchronous query state.
 *
 * @remarks
 * This provider manages a store of queries, tracks their fetch status, caches data if a cache plugin is provided,
 * and exposes a `fetchData` function to initiate data fetching. It uses React hooks to update and persist state.
 *
 * @param props - The properties for the provider including child nodes and an optional cache.
 * @returns A React context provider that wraps its children with query state management.
 */
const QueryProvider = ({ children, cache }: QueryProviderProps) => {
    // Initialize the query store state as an empty object.
    const [queryStore, setQueryStore] = useState<QueryStore>({});
    // Use a ref to persist the current query store across renders.
    const queryStoreRef = useRef(queryStore);

    // Sync the ref with the current query store whenever it updates.
    useEffect(() => {
        queryStoreRef.current = queryStore;
    }, [queryStore]);

    /**
     * Initiates an asynchronous fetch for the specified query key.
     *
     * @remarks
     * Checks if a fetch is already in progress for the key. If a cache is available and contains data,
     * it uses that data to update the state immediately. Otherwise, it sets the state to loading,
     * performs the fetch, updates the cache if available, and sets the final state based on success or error.
     *
     * @param key - The unique key representing the query.
     * @param fetchFn - A function returning a promise that resolves with an object containing the fetched data.
     */
    const fetchData = useCallback(
        async (key: string, fetchFn: () => Promise<{ data: unknown }>) => {
            // Exit early if a fetch is already in progress for this key.
            if (queryStoreRef.current[key]?.isFetching) {
                return;
            }

            // If a cache is provided and no data exists for the key, attempt to retrieve cached data.
            if (cache && !queryStoreRef.current[key]) {
                const cachedData = cache.get(key);
                if (cachedData !== undefined) {
                    // Update the store with cached data and mark the fetch as not in progress.
                    setQueryStore((prevStore) => ({
                        ...prevStore,
                        [key]: {
                            status: "success",
                            data: cachedData,
                            isFetching: false,
                            refetch: () => fetchData(key, fetchFn),
                        },
                    }));
                    // Optionally, you might trigger a background revalidation here.
                }
            }

            // Update the query store to indicate that the fetch for this key is in progress.
            setQueryStore((prevStore) => {
                const newStore = { ...prevStore };
                if (!newStore[key]) {
                    // If the key is not already in the store, initialize its state.
                    newStore[key] = {
                        status: "loading",
                        isFetching: true,
                        refetch: () => fetchData(key, fetchFn),
                    };
                } else {
                    // If the key exists, simply mark it as fetching.
                    newStore[key].isFetching = true;
                }
                return newStore;
            });

            try {
                // Execute the provided fetch function.
                const { data } = await fetchFn();

                // On successful fetch, update the cache if available.
                if (cache) {
                    cache.set(key, data);
                }
                // Update the query store with the successful data and mark fetching as complete.
                setQueryStore((prevStore) => {
                    const newStore = { ...prevStore };
                    newStore[key] = {
                        status: "success",
                        data,
                        isFetching: false,
                        refetch: () => fetchData(key, fetchFn),
                    };
                    return newStore;
                });
            } catch (error) {
                // On error, update the query store with the error details.
                setQueryStore((prevStore) => {
                    const newStore = { ...prevStore };
                    newStore[key] = {
                        status: "error",
                        error,
                        isFetching: false,
                        refetch: () => fetchData(key, fetchFn),
                    };
                    return newStore;
                });
            }
        },
        [setQueryStore, cache]
    );

    // Render the context provider with the query store and fetchData function as its value.
    return (
        <QueryContext.Provider value={{ queryStore, fetchData }}>
            {children}
        </QueryContext.Provider>
    );
};

export { QueryProvider, QueryContext };

import {
    createContext,
    useState,
    ReactNode,
    useRef,
    useEffect,
    useCallback,
} from "react";
import { QueryStore } from "./types";

/**
 * The shape of the context value for query state management.
 *
 * @property queryStore - A mapping of query keys to their state.
 * @property fetchData - A function to trigger data fetching for a given query key.
 */
const QueryContext = createContext<
    | {
        queryStore: QueryStore;
        /**
         * Initiates an asynchronous fetch for the specified query key and updates the query state.
         *
         * @param key - Unique identifier for the query.
         * @param fetchFn - Asynchronous function that returns an object with a `data` property.
         */
        fetchData: (key: string, fetchFn: () => Promise<{ data: unknown }>) => void;
    }
    | undefined
>(undefined);

/**
 * QueryProvider component that supplies query state management to its children.
 *
 * This component maintains a global store of query states (idle, loading, success, error)
 * and provides a memoized `fetchData` function that updates the store accordingly.
 * It leverages a ref to always access the most up-to-date store state, thereby avoiding
 * potential race conditions with asynchronous fetch calls.
 *
 * @param children - Child components that require access to query state.
 * @returns A React element that wraps its children with the QueryContext provider.
 */
const QueryProvider = ({ children }: { children: ReactNode }) => {
    // Local state holding the mapping of query keys to their states.
    const [queryStore, setQueryStore] = useState<QueryStore>({});

    // A ref to hold the latest queryStore value to avoid stale closures in async callbacks.
    const queryStoreRef = useRef(queryStore);

    // Update the ref whenever queryStore changes.
    useEffect(() => {
        queryStoreRef.current = queryStore;
    }, [queryStore]);

    /**
     * Memoized function to fetch data for a given query key.
     *
     * It first checks if a fetch is already in progress for the given key by reading from the ref.
     * If not, it sets the query state to loading, then executes the provided fetch function.
     * Upon success or error, it updates the query store accordingly.
     *
     * @param key - Unique identifier for the query.
     * @param fetchFn - Asynchronous function that returns data.
     */
    const fetchData = useCallback(
        async (key: string, fetchFn: () => Promise<{ data: unknown }>) => {
            // If a fetch is already in progress for this key, exit early.
            if (queryStoreRef.current[key]?.isFetching) {
                return;
            }

            // Update the state to indicate that the query is loading.
            setQueryStore((prevStore) => {
                const newStore = { ...prevStore };
                if (!newStore[key]) {
                    // If no state exists for this key, create a new one.
                    newStore[key] = {
                        status: "loading",
                        isFetching: true,
                        refetch: () => fetchData(key, fetchFn),
                    };
                } else {
                    // Otherwise, just mark it as fetching.
                    newStore[key].isFetching = true;
                }
                return newStore;
            });

            try {
                // Execute the provided fetch function.
                const { data } = await fetchFn();
                // Update the state to reflect successful fetch.
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
                // On error, update the state with error information.
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
        [setQueryStore]
    );

    return (
        <QueryContext.Provider value={{ queryStore, fetchData }}>
            {children}
        </QueryContext.Provider>
    );
};

export { QueryProvider, QueryContext };

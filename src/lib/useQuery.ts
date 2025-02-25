import { useContext, useEffect } from "react";
import { QueryContext } from "./QueryProvider";
import { QueryState } from "./types";

/**
 * Custom hook for managing asynchronous queries.
 *
 * This hook retrieves the current query state from the QueryContext based on the provided key.
 * If the state is not present or is idle, it will trigger the fetch function to load data.
 *
 * @template T - The expected type of the fetched data.
 * @template E - The expected type of the error (defaults to Error).
 * @param key - Unique identifier for the query.
 * @param fetchFn - Asynchronous function that fetches data and returns an object containing the data.
 * @returns The current state of the query including its status, fetched data (if any), error (if any), and a refetch function.
 */
const useQuery = <T, E = Error>(
    key: string,
    fetchFn: () => Promise<{ data: T }>
): QueryState<T, E> => {
    // Retrieve the QueryContext which holds the global query store and fetchData function.
    const context = useContext(QueryContext);
    if (!context) {
        throw new Error("useQuery must be used within a QueryProvider");
    }
    const { queryStore, fetchData } = context;

    // Default state for a query that hasn't been fetched yet.
    const defaultState: QueryState<T, E> = {
        status: "idle",
        isFetching: false,
        refetch: () => fetchData(key, fetchFn),
    };

    // Extract the current state for the provided key; if it doesn't exist, use the default state.
    const currentQuery = queryStore[key] as QueryState<T, E> | undefined;
    const queryState = currentQuery || defaultState;

    useEffect(() => {
        // If there's no state for this key, or if it's idle or in an inconsistent loading state,
        // trigger a data fetch.
        if (
            !currentQuery ||
            currentQuery.status === "idle" ||
            (currentQuery.status === "loading" && !currentQuery.isFetching)
        ) {
            fetchData(key, fetchFn);
        }
        // We include key, fetchFn, currentQuery, and fetchData in the dependency array.
    }, [key, fetchFn, currentQuery, fetchData]);

    return queryState;
};

export default useQuery;

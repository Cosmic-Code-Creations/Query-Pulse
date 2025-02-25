/**
 * Represents the current status of a query.
 * @typedef {'idle' | 'loading' | 'success' | 'error'}
 */
export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Interface representing the state of a query.
 * 
 * @template T - The type of the data returned on success.
 * @template E - The type of the error on failure.
 */
export interface QueryState<T = unknown, E = unknown> {
    /** Current status of the query */
    status: QueryStatus;
    /** Data returned from a successful query */
    data?: T;
    /** Error object returned on failure */
    error?: E;
    /** Indicates if a query is currently being fetched */
    isFetching: boolean;
    /**
     * Function to manually refetch the query.
     * This is useful for manual refreshes or retrying after an error.
     */
    refetch: () => void;
}

/**
 * A store that maps query keys to their respective state.
 */
export type QueryStore = { [key: string]: QueryState };

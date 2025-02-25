import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryProvider, QueryContext } from "../lib/QueryProvider";
import type { CachePlugin } from "../lib/types";

// Define a type alias for the context value to avoid using "any"
type QueryContextValue = NonNullable<React.ContextType<typeof QueryContext>>;

describe("QueryProvider - Context Provision", () => {
    it("provides a context value", () => {
        const TestComponent = () => {
            const context = React.useContext(QueryContext);
            return <div>{context ? "Context exists" : "No context"}</div>;
        };

        render(
            <QueryProvider>
                <TestComponent />
            </QueryProvider>
        );

        expect(screen.getByText("Context exists")).toBeDefined();
    });
});

describe("QueryProvider - fetchData", () => {
    it("updates the query store on a successful fetch", async () => {
        const fakeData = { data: "test" };
        const fetchFn = vi.fn().mockResolvedValue(fakeData);
        let contextValue: QueryContextValue;

        const TestComponent = () => {
            const ctx = React.useContext(QueryContext);
            if (!ctx) throw new Error("No context provided");
            contextValue = ctx;
            return <div>Test</div>;
        };

        render(
            <QueryProvider>
                <TestComponent />
            </QueryProvider>
        );

        act(() => {
            contextValue.fetchData("key1", fetchFn);
        });

        await waitFor(() => {
            expect(contextValue.queryStore["key1"].status).toBe("success");
            expect(contextValue.queryStore["key1"].data).toBe("test");
        });
    });

    it("updates the query store on fetch error", async () => {
        const fakeError = new Error("failure");
        const fetchFn = vi.fn().mockRejectedValue(fakeError);
        let contextValue: QueryContextValue;

        const TestComponent = () => {
            const ctx = React.useContext(QueryContext);
            if (!ctx) throw new Error("No context provided");
            contextValue = ctx;
            return <div>Test</div>;
        };

        render(
            <QueryProvider>
                <TestComponent />
            </QueryProvider>
        );

        act(() => {
            contextValue.fetchData("key2", fetchFn);
        });

        await waitFor(() => {
            expect(contextValue.queryStore["key2"].status).toBe("error");
            expect(contextValue.queryStore["key2"].error).toEqual(fakeError);
        });
    });
});

describe("QueryProvider - Caching Behavior", () => {
    it("uses cached data if available", async () => {
        const fakeCachedData = "cachedData";
        const cache: CachePlugin = {
            get: vi.fn().mockReturnValue(fakeCachedData),
            set: vi.fn(),
            delete: vi.fn(), // added to satisfy the CachePlugin interface
        };

        let contextValue: QueryContextValue;
        const TestComponent = () => {
            const ctx = React.useContext(QueryContext);
            if (!ctx) throw new Error("No context provided");
            contextValue = ctx;
            return <div>Test</div>;
        };

        render(
            <QueryProvider cache={cache}>
                <TestComponent />
            </QueryProvider>
        );

        act(() => {
            contextValue.fetchData("key3", async () => ({ data: "newData" }));
        });

        await waitFor(() => {
            expect(cache.get).toHaveBeenCalledWith("key3");
            expect(contextValue.queryStore["key3"].status).toBe("success");
            expect(contextValue.queryStore["key3"].data).toBe(fakeCachedData);
        });
    });
});

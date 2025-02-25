/// <reference types="vitest/globals" />
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryProvider } from "../lib/QueryProvider";
import useQuery from "../lib/useQuery";
import { vi } from "vitest";

// Define the expected structure of a User.
interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
        street: string;
        suite: string;
        city: string;
        zipcode: string;
        geo: {
            lat: string;
            lng: string;
        };
    };
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
        bs: string;
    };
}

// A simple test component that uses useQuery.
const TestComponent = ({
    queryKey,
    fetchFn,
}: {
    queryKey: string;
    fetchFn: () => Promise<{ data: User[] }>;
}) => {
    const { status, data, refetch } = useQuery(queryKey, fetchFn);
    return (
        <div>
            <div data-testid="status">{status}</div>
            {data && <div data-testid="data">{JSON.stringify(data)}</div>}
            <button onClick={refetch}>Refetch</button>
        </div>
    );
};

describe("useQuery and QueryProvider", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test("renders loading then success with fetched data", async () => {
        // Create a minimal full User object.
        const user: User = {
            id: 1,
            name: "John Doe",
            username: "johndoe",
            email: "john@example.com",
            address: {
                street: "Main St",
                suite: "Apt 1",
                city: "Metropolis",
                zipcode: "12345",
                geo: { lat: "0", lng: "0" },
            },
            phone: "123-456-7890",
            website: "example.com",
            company: { name: "Acme", catchPhrase: "Innovate!", bs: "business" },
        };

        // Stub global fetch for this test.
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            json: async () => [user],
        } as Response);

        render(
            <QueryProvider>
                <TestComponent
                    queryKey="users"
                    fetchFn={async () => {
                        const response = await fetch("https://example.com/users");
                        return { data: await response.json() };
                    }}
                />
            </QueryProvider>
        );

        // Initially, it should show "loading".
        expect(screen.getByTestId("status")).toHaveTextContent(/loading/i);

        // Wait for the success state.
        await waitFor(() =>
            expect(screen.getByTestId("status")).toHaveTextContent(/success/i)
        );
        expect(screen.getByTestId("data")).toHaveTextContent(/John Doe/i);
    });

    test("refetch button triggers a new fetch", async () => {
        const user: User = {
            id: 2,
            name: "Jane Doe",
            username: "janedoe",
            email: "jane@example.com",
            address: {
                street: "Second St",
                suite: "Apt 2",
                city: "Gotham",
                zipcode: "54321",
                geo: { lat: "0", lng: "0" },
            },
            phone: "987-654-3210",
            website: "example.org",
            company: { name: "Beta", catchPhrase: "Evolve!", bs: "tech" },
        };

        // Define a fetch function mock that returns the user.
        const fetchMock = vi.fn(async () => ({ data: [user] }));
        render(
            <QueryProvider>
                <TestComponent queryKey="users" fetchFn={fetchMock} />
            </QueryProvider>
        );

        // Wait for the initial fetch to complete.
        await waitFor(() =>
            expect(screen.getByTestId("status")).toHaveTextContent(/success/i)
        );
        expect(screen.getByTestId("data")).toHaveTextContent(/Jane Doe/i);

        // Click the refetch button.
        fireEvent.click(screen.getByRole("button", { name: /refetch/i }));
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    });

    test("duplicate fetch is prevented when one is in progress", async () => {
        const user: User = {
            id: 3,
            name: "Alex Doe",
            username: "alexdoe",
            email: "alex@example.com",
            address: {
                street: "Third St",
                suite: "Apt 3",
                city: "Star City",
                zipcode: "67890",
                geo: { lat: "0", lng: "0" },
            },
            phone: "555-555-5555",
            website: "example.net",
            company: { name: "Gamma", catchPhrase: "Innovate!", bs: "media" },
        };

        // Create a pending fetch promise.
        let resolveFetch: (value: { data: User[] }) => void = () => { };
        const fetchPromise = new Promise<{ data: User[] }>((resolve) => {
            resolveFetch = resolve;
        });
        const fetchFn = vi.fn(() => fetchPromise);

        render(
            <QueryProvider>
                <TestComponent queryKey="duplicate" fetchFn={fetchFn} />
            </QueryProvider>
        );

        // The initial fetch should be called.
        expect(fetchFn).toHaveBeenCalledTimes(1);

        // Trigger refetch while the fetch is still pending.
        fireEvent.click(screen.getByRole("button", { name: /refetch/i }));
        // Since a fetch is already in progress, it should not call fetchFn again.
        expect(fetchFn).toHaveBeenCalledTimes(1);

        // Now resolve the fetch.
        resolveFetch({ data: [user] });
        await waitFor(() =>
            expect(screen.getByTestId("status")).toHaveTextContent(/success/i)
        );
        expect(screen.getByTestId("data")).toHaveTextContent(/Alex Doe/i);
    });
});

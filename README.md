# Query Pulse

**Query Pulse** is a lightweight state management library for React that simplifies asynchronous data fetching and query state handling. Built with TypeScript, it leverages React Context and Hooks to provide a robust, intuitive API for managing query states such as `idle`, `loading`, `success`, and `error`. This library now includes basic caching capabilities through customizable caching plugins.

## Features

- **Minimal & Intuitive API:** Manage asynchronous queries with a straightforward, easy-to-learn interface.
- **Query State Management:** Seamlessly handle `idle`, `loading`, `success`, and `error` states with built-in type safety.
- **Automatic Deduplication:** Prevents duplicate fetches when a query is already in progress.
- **Manual Refetching:** Trigger data refreshes on demand with a provided `refetch` function.
- **Basic Caching Plugin Support:** Integrate caching solutions using plugins to store and retrieve query data.
- **Zero External Dependencies:** Lightweight and focused solely on query state management, requiring only React as a peer dependency.

## Installation

Install **Query Pulse** using your preferred package manager (e.g., Bun, npm, or yarn):

```bash
bun add query-pulse
```

Ensure that you also have `react` and `react-dom` installed as they are peer dependencies.

```bash
buna add react react-dom
```

## Usage

### Setting Up the QueryProvider

To use Query Pulse, wrap your application (or a portion of it) with the QueryProvider component. This provides the context necessary for the useQuery hook to function.

```ts
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { QueryProvider } from "query-pulse"; // Import from the library

// Render the app with QueryProvider at the root
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>
);
```

## Using a Caching Plugin

You can enhance Query Pulse by supplying a caching plugin to the QueryProvider. This plugin will store and retrieve data to minimize redundant network requests.

### Example: Creating a Simple Caching Plugin

```tsx
// src/plugins/MyCachePlugin.ts
import { CachePlugin } from "query-pulse";

/**
 * A basic in-memory caching plugin.
 */
class MyCachePlugin implements CachePlugin {
  private store: { [key: string]: unknown } = {};

  /**
   * Retrieves cached data for the specified key.
   *
   * @param key - The unique key for the cached data.
   * @returns The cached data, or undefined if not found.
   */
  get(key: string): unknown {
    return this.store[key];
  }

  /**
   * Caches data under the specified key.
   *
   * @param key - The unique key for the data.
   * @param data - The data to cache.
   */
  set(key: string, data: unknown): void {
    this.store[key] = data;
  }
}

export default new MyCachePlugin();
```

### Example: Integrating the Caching Plugin with QueryProvider

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { QueryProvider } from "query-pulse";
import myCachePlugin from "./plugins/MyCachePlugin";

// Wrap your application with QueryProvider and pass in the caching plugin
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider cache={myCachePlugin}>
      <App />
    </QueryProvider>
  </StrictMode>
);
```

## Example 1: Fetching a List of Users

This example demonstrates how to fetch a list of users from an API and handle different query states.

```ts
// src/components/UserList.tsx
import useQuery from "query-pulse";

// Define the shape of the data you expect to fetch
interface User {
  id: number;
  name: string;
  email: string;
}

const UserList = () => {
  // Use useQuery to fetch data
  // - "users" is a unique key to identify this query
  // - The fetch function returns a Promise resolving with an object containing { data }
  const { status, data, error, refetch } = useQuery<User[], Error>(
    "users",
    async () => {
      const response = await fetch("https://jsonplaceholder.typicode.com/users");
      return { data: await response.json() }; // Must return { data }
    }
  );

  if (status === "loading") {
    return <div>Loading users...</div>;
  }

  if (status === "error") {
    return <div>Error: {error instanceof Error ? error.message : "Unknown error"}</div>;
  }

  if (status === "success" && data) {
    return (
      <div>
        <h1>User List</h1>
        <ul>
          {data.map((user) => (
            <li key={user.id}>{user.name} - {user.email}</li>
          ))}
        </ul>
        <button onClick={refetch}>Refresh Users</button>
      </div>
    );
  }

  return <div>Idle</div>;
};

export default UserList;
```

## Example 2: Fetching a Single Post with Error Handling

```ts
// src/components/PostDetail.tsx
import useQuery from "query-pulse";

interface Post {
  id: number;
  title: string;
  body: string;
}

const PostDetail = ({ postId }: { postId: number }) => {
  // Use a dynamic key based on postId to fetch a specific post
  const { status, data, error, refetch } = useQuery<Post, Error>(
    `post-${postId}`,
    async () => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
      if (!response.ok) throw new Error("Post not found");
      return { data: await response.json() };
    }
  );

  if (status === "loading") {
    return <div>Loading post...</div>;
  }

  if (status === "error") {
    return (
      <div>
        <p>Error: {error instanceof Error ? error.message : "Failed to load post"}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  if (status === "success" && data) {
    return (
      <div>
        <h1>{data.title}</h1>
        <p>{data.body}</p>
        <button onClick={refetch}>Refresh Post</button>
      </div>
    );
  }

  return null;
};

export default PostDetail;
```

## Key Concepts

- Query Keys: Each `useQuery` call requires a unique key (e.g., `"users"`, `"post-1"`). This key ties the query state to the fetched data and prevents conflicts.
- Fetch Function: The second argument to `useQuery` must be an async function returning an object with a `data` property (e.g., { data: fetchedData }).
- State Handling: Use the `status` property (`idle`, `loading`, `success`, `error`) to conditionally render UI based on the query's current state.
- Refetching: The `refetch` function allows manual data refresh without re-rendering the component unnecessarily.
- **Caching Plugins**: Extend the library by integrating caching plugins to improve performance and reduce redundant data fetching.

## Building the Library

To build **Query Pulse** for production, which includes bundling the library and generating TypeScript type declarations, run:

```bash
bun run build
```

This command:

1. Uses tsconfig.lib.json to generate TypeScript declaration files (.d.ts) in the dist directory.
2. Bundles the library using Vite for distribution.

### Running Tests

To ensure the library works as expected, you can run the test suite with the following command:

```bash
bunx vitest
```

This runs all tests defined in `src/tests/` using Vitest. The tests cover:

- Initial loading and successful data fetching.
- Refetch functionality to ensure manual refreshes work.
- Fetch deduplication to prevent redundant API calls during pending fetches.

Make sure you have Vitest and testing dependencies installed:

```bash
bun add -D vitest @testing-library/react @testing-library/jest-dom
```

Before running tests, ensure `src/setupTests.ts` is configured to extend Jest DOM matchers:

```tsx
// src/setupTests.ts
import "@testing-library/jest-dom";
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for features, bug fixes, or improvements. For suggestions or questions, please use our [Discussions](https://github.com/Cosmic-Code-Creations/Query-Pulse/discussions) page.

## License

[Licensed under MIT](./LICENSE)

## Current State (February 25, 2025)

### Development Status

**Alpha**

- Fully functional with a stable API for query management.
- Basic Caching Implemented: Supports caching plugins for improved performance.
- Robust TypeScript support with generic types for data and errors.
- Tests cover core functionality including loading, success, error handling, refetching, and deduplication.
- Codebase is modular with clear separation between QueryProvider, useQuery, and types.

### Future Roadmap

- Advanced Caching Strategies: Implement cache expiration, revalidation, and offline support.
- Optimistic Updates: Enable real-time UI updates before fetch completion.
- Pagination Support: Enhance handling for large datasets with built-in pagination.
- Enhanced Error Handling: Improve granular error management and retry mechanisms.

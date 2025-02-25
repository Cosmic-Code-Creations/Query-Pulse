# Query Pulse

**Query Pulse** is a lightweight state management library for React that simplifies asynchronous data fetching and query state handling. Built with TypeScript, it leverages React Context and Hooks to provide a robust, intuitive API for managing query states such as `idle`, `loading`, `success`, and `error`. This library is ideal for developers who need a simple yet powerful solution for handling API calls in React applications.

## Features

- **Minimal & Intuitive API:** Manage asynchronous queries with a straightforward, easy-to-learn interface.
- **Query State Management:** Seamlessly handle `idle`, `loading`, `success`, and `error` states with built-in type safety.
- **Automatic Deduplication:** Prevents duplicate fetches when a query is already in progress.
- **Manual Refetching:** Trigger data refreshes on demand with a provided `refetch` function.
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

## Example 1: Fetching a List of Users

This example demonstrates how to fetch a list of users from an API and handle different query states.

```ts
// src/components/UserList.tsx
import useQuery from "query-pulse"; // Import the useQuery hook

// Define the shape of the data you expect to fetch
interface User {
  id: number;
  name: string;
  email: string;
}

const UserList = () => {
  // Use useQuery to fetch data
  // - 'users' is a unique key to identify this query
  // - The fetch function returns a Promise with a { data } object
  const { status, data, error, refetch } = useQuery<User[], Error>(
    "users",
    async () => {
      const response = await fetch("https://jsonplaceholder.typicode.com/users");
      return { data: await response.json() }; // Must return { data }
    }
  );

  // Handle the loading state while data is being fetched
  if (status === "loading") {
    return <div>Loading users...</div>;
  }

  // Handle errors if the fetch fails
  if (status === "error") {
    return <div>Error: {error instanceof Error ? error.message : "Unknown error"}</div>;
  }

  // Render the data when fetch succeeds
  if (status === "success" && data) {
    return (
      <div>
        <h1>User List</h1>
        <ul>
          {/* Map over the fetched users and display their names */}
          {data.map((user) => (
            <li key={user.id}>{user.name} - {user.email}</li>
          ))}
        </ul>
        {/* Button to manually refetch the data */}
        <button onClick={refetch}>Refresh Users</button>
      </div>
    );
  }

  // Fallback for unexpected states (rarely reached due to exhaustive checks)
  return <div>Idle</div>;
};

export default UserList;
```

## Example 2: Fetching a Single Post with Error Handling

This example shows how to fetch a single resource (e.g., a blog post) and includes retry logic for failed fetches.

```ts
// src/components/PostDetail.tsx
import useQuery from "query-pulse";

// Define the shape of a Post
interface Post {
  id: number;
  title: string;
  body: string;
}

const PostDetail = ({ postId }: { postId: number }) => {
  // Use a dynamic key based on the postId to fetch a specific post
  const { status, data, error, refetch } = useQuery<Post, Error>(
    `post-${postId}`, // Unique key for this specific post
    async () => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
      if (!response.ok) throw new Error("Post not found"); // Throw an error on failure
      return { data: await response.json() };
    }
  );

  // Display a loading spinner while fetching
  if (status === "loading") {
    return <div>Loading post...</div>;
  }

  // Show error with a retry option
  if (status === "error") {
    return (
      <div>
        <p>Error: {error instanceof Error ? error.message : "Failed to load post"}</p>
        <button onClick={refetch}>Retry</button> {/* Allow user to retry the fetch */}
      </div>
    );
  }

  // Render the post details on success
  if (status === "success" && data) {
    return (
      <div>
        <h1>{data.title}</h1>
        <p>{data.body}</p>
        <button onClick={refetch}>Refresh Post</button>
      </div>
    );
  }

  return null; // Fallback (e.g., idle state)
};

export default PostDetail;
```

## Key Concepts

- Query Keys: Each `useQuery` call requires a unique key (e.g., `"users"`, `"post-1"`). This key ties the query state to the fetched data and prevents conflicts.
- Fetch Function: The second argument to `useQuery` must be an async function returning an object with a `data` property (e.g., { data: fetchedData }).
- State Handling: Use the `status` property (`idle`, `loading`, `success`, `error`) to conditionally render UI based on the query's current state.
- Refetching: The `refetch` function allows manual data refresh without re-rendering the component unnecessarily.

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

As of the latest update:

- The library is fully functional with a stable API for query management.
- TypeScript support is robust, with generic types for data (T) and errors (E).
- Tests are implemented to verify core functionality (loading, success, refetching, deduplication).
- The codebase is organized with a clear separation of concerns (QueryProvider, useQuery, types).
- No known critical bugs; ongoing development focuses on performance optimizations and additional features (e.g., caching options).

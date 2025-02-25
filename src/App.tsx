import useQuery from "./lib/useQuery";
import "./styles.css";

// --- Type Definitions ---
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// --- Section Components ---
const UsersSection = () => {
  const { status, data, error, refetch } = useQuery<User[], Error>(
    "users",
    async () => {
      const response = await fetch("https://jsonplaceholder.typicode.com/users");
      return { data: await response.json() };
    }
  );

  return (
    <div className="card">
      <h2>Users</h2>
      {status === "loading" && <p>Loading users...</p>}
      {status === "error" && (
        <p>Error: {error instanceof Error ? error.message : String(error)}</p>
      )}
      {status === "success" && data && (
        <ul>
          {data.map((user) => (
            <li key={user.id}>
              {user.name} (<em>{user.email}</em>)
            </li>
          ))}
        </ul>
      )}
      <button onClick={refetch}>Refetch Users</button>
    </div>
  );
};

const PostsSection = () => {
  const { status, data, error, refetch } = useQuery<Post[], Error>(
    "posts",
    async () => {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts");
      return { data: await response.json() };
    }
  );

  return (
    <div className="card">
      <h2>Posts</h2>
      {status === "loading" && <p>Loading posts...</p>}
      {status === "error" && (
        <p>Error: {error instanceof Error ? error.message : String(error)}</p>
      )}
      {status === "success" && data && (
        <ul>
          {data.slice(0, 5).map((post) => (
            <li key={post.id}>
              <strong>{post.title}</strong>
              <p>{post.body}</p>
            </li>
          ))}
        </ul>
      )}
      <button onClick={refetch}>Refetch Posts</button>
    </div>
  );
};

const TodosSection = () => {
  const { status, data, error, refetch } = useQuery<Todo[], Error>(
    "todos",
    async () => {
      const response = await fetch("https://jsonplaceholder.typicode.com/todos");
      return { data: await response.json() };
    }
  );

  return (
    <div className="card">
      <h2>Todos</h2>
      {status === "loading" && <p>Loading todos...</p>}
      {status === "error" && (
        <p>Error: {error instanceof Error ? error.message : String(error)}</p>
      )}
      {status === "success" && data && (
        <ul>
          {data.slice(0, 5).map((todo) => (
            <li key={todo.id}>
              {todo.title} {todo.completed ? "(Completed)" : "(Pending)"}
            </li>
          ))}
        </ul>
      )}
      <button onClick={refetch}>Refetch Todos</button>
    </div>
  );
};

// --- Dashboard ---
const Dashboard = () => {
  return (
    <div className="dashboard">
      <header>
        <h1>Composite Dashboard</h1>
      </header>
      <main>
        <UsersSection />
        <PostsSection />
        <TodosSection />
      </main>
    </div>
  );
};

export default Dashboard;
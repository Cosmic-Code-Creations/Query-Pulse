import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { QueryProvider } from './lib/QueryProvider'
import { createCachePlugin } from "./lib/plugins/cache";

const cache = createCachePlugin("InMemoryCache");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider cache={cache}>
      <App />
    </QueryProvider>
  </StrictMode>,
)


import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// Override console.error to properly stringify objects
const origError = console.error;
console.error = (...args: any[]) => {
  const safeArgs = args.map(a =>
    typeof a === "object" && a !== null ? JSON.stringify(a, null, 2) : a
  );
  origError(...safeArgs);
};

// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

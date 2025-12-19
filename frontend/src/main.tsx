import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/socket"; // Ensure this path is correct

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </SocketProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
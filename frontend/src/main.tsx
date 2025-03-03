import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PostHogProvider } from "posthog-js/react";
import { config } from "./config.ts";

const options = {
  api_host: config.posthogHost,
};
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider apiKey={config.posthogKey} options={options}>
      <App />
    </PostHogProvider>
  </StrictMode>
);

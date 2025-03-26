import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PostHogProvider } from "posthog-js/react";
import { HelmetProvider } from "react-helmet-async";
import { config } from "./config.ts";

const options = {
  api_host: config.posthogHost,
};

const rootElement = document.getElementById("root")!;
const app = (
  <StrictMode>
    <HelmetProvider>
      <PostHogProvider apiKey={config.posthogKey} options={options}>
        <App />
      </PostHogProvider>
    </HelmetProvider>
  </StrictMode>
);

// If the page was pre-rendered, hydrate it, otherwise create a new root
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}

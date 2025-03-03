export const config = {
  posthogKey: import.meta.env.VITE_PUBLIC_POSTHOG_KEY || "",
  posthogHost:
    import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
};

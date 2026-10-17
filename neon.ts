import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  auth: false,
  // El Espía: cada celu recibe su rol en vivo. Cada origen que abre la app tiene que estar acá.
  preview: {
    realtime: {
      allowedOrigins: ["https://last-postre.vercel.app", "http://localhost:3000", "http://localhost:3123", "http://localhost:3456"],
    },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});

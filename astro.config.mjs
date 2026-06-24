// @ts-check
import { defineConfig } from "astro/config";

// Static marketing site, near-zero JS. Output is fully static so push-to-deploy
// on Vercel works with no server runtime assumptions.
// https://astro.build/config
export default defineConfig({
  site: "https://componentdebt.com",
});

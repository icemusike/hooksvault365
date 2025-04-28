// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'server', // Enable server mode for API endpoints
  adapter: node({
    mode: 'standalone'
  }),
  redirects: {
    // Remove the line below to allow authenticated users to access the dashboard
    // '/': '/landing'
  }
});

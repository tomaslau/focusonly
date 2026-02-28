import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'FocusOnly',
    description: 'AI-powered webpage relevance evaluator — Leave / Read / Save',
    permissions: ['activeTab', 'storage', 'scripting', 'webNavigation'],
    host_permissions: ['<all_urls>'],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});

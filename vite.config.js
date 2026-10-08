import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  publicDir: 'public',
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        task1: resolve(__dirname, 'tasks/task1-kanban.html'),
        task2: resolve(__dirname, 'tasks/task2-video-player.html'),
        task3: resolve(__dirname, 'tasks/task3-expense-tracker.html'),
        task4: resolve(__dirname, 'tasks/task4-chat.html'),
        task5: resolve(__dirname, 'tasks/task5-dashboard.html')
      }
    }
  }
});

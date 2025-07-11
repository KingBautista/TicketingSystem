import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Makes it accessible via local network IP
    port: 4000,       // Set the port to 4000
    open: true,       // Optionally open the browser automatically
  },
})

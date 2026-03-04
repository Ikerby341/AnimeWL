import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  // servir 'public' como root para que index.html pueda estar dentro de /public
  root: 'public',
  // la carpeta pública dentro de root es la propia carpeta public
  publicDir: '.',
  plugins: [react()],
  resolve: {
    alias: {
      // permitir importar desde /src/... cuando root='public'
      '/src': path.resolve(__dirname, 'src')
    }
  },
  server: {
    fs: {
      // permitir acceso al resto del proyecto (p. ej. ../src)
      allow: ['..']
    },
    // proxy para las rutas de API hacia el servidor Express
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // generar build en client/dist
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      // usar ruta absoluta resuelta al index dentro de public
      input: path.resolve(__dirname, 'public', 'index.html')
    }
  }
})

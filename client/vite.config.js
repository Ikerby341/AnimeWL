import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname)
  const backendUrl = env.VITE_BACKENDURL || 'http://localhost:3000'

  return {
    // servir 'public' como root para que index.html pueda estar dentro de /public
    root: 'public',
    envDir: __dirname,
    cacheDir: path.resolve(__dirname, 'node_modules/.vite'),
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
          target: backendUrl,
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
    },
    test: {
      environment: 'node',
      include: ['../src/**/*.{test,spec}.js']
    }
  }
})

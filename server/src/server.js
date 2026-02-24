import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);	// Ruta d'aquest arxiu (servidor.js)
const __dirname = path.dirname(__filename);			// Ruta de la carpeta on es troba aquest arxiu

const app = express();
const PORT = 3000;

// Middleware per convetir JSON
app.use(express.json());

// Servir arxius estàtics des de la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Carpeta on es troben les plantilles (arxius .ejs)
//	i el motor que s'utilitzarà per generar les pàgines html
app.set('views', path.join(__dirname, '../plantilles'));
app.set('view engine', 'ejs');

// Iniciar el servidor
app.listen(PORT, () => {
	console.log(`Servidor escoltant a http://localhost:${PORT}`);
});
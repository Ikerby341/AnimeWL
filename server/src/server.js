import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from './config/db.js';
const __filename = fileURLToPath(import.meta.url);	// Ruta d'aquest arxiu (servidor.js)
const __dirname = path.dirname(__filename);			// Ruta de la carpeta on es troba aquest arxiu

const app = express();
const PORT = 3000;

// Middleware para convertir JSON
app.use(express.json());

// programar / inicializar la sincronización diaria de datos de anime
// import syncAllAnime from './controllers/syncAnime.js';
// ejecutar una vez al iniciar el servidor
// syncAllAnime().catch(console.error);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Carpeta donde se encuentran las plantillas (archivos .ejs)
//	y el motor que se utilizará para generar las páginas html
app.set('views', path.join(__dirname, '../plantilles'));
app.set('view engine', 'ejs');

app.get('/test-db', async (req, res) => {
	const { data, error } = await supabase
		.from('anime')
		.select('*')
		.limit(1);

	if (error) {
		console.error('Supabase error:', error);
		return res.status(500).json({ success: false, error });
	}
	res.json({ success: true, rows: data });
});

// Iniciar el servidor (arrancar la aplicación)
app.listen(PORT, () => {
	console.log(`Servidor escoltant a http://localhost:${PORT}`);
});
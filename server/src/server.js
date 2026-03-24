import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import supabase from './config/db.js';
import { syncAnimeById, syncAnimeMetadataById, mapJikanToDb } from './controllers/syncAnime.js';
import { findAnimeById, listAnimes } from './models/anime_model.js';
const __filename = fileURLToPath(import.meta.url);	// Ruta d'aquest arxiu (servidor.js)
const __dirname = path.dirname(__filename);			// Ruta de la carpeta on es troba aquest arxiu

const app = express();
const PORT = 3000;

// Middleware para convertir JSON
app.use(express.json());
// permitir peticiones desde el cliente React en desarrollo
app.use(cors());

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

// helper sencillo que utiliza la API pública de MyMemory para traducir.
// divide el texto en trozos de 500 caracteres para evitar límites del servicio.
async function translateText(text, source = 'en', target = 'es') {
	if (!text) return '';
	const maxLen = 500;
	let translated = '';
	for (let i = 0; i < text.length; i += maxLen) {
		const chunk = text.slice(i, i + maxLen);
		try {
			const res = await axios.get('https://api.mymemory.translated.net/get', {
				params: {
					q: chunk,
					langpair: `${source}|${target}`,
				},
			});
			const part = (res.data && res.data.responseData && res.data.responseData.translatedText) || chunk;
			console.log('translateText chunk', chunk.slice(0, 50).replace(/\n/g, ' '), '=>', part.slice(0, 50).replace(/\n/g, ' '));
			translated += part;
		} catch (err) {
			console.error('translateText chunk error', err.message);
			translated += chunk; // fallback al original
		}
	}
	return translated;
}

// endpoint que devuelve todos los animes almacenados
app.get('/api/anime', async (req, res) => {
	try {
		const anime = await listAnimes();
		res.json({ success: true, anime });
	} catch (err) {
		console.error('GET /api/anime error', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// endpoint que devuelve animes recientes con límite
app.get('/api/anime/recent/:limit', async (req, res) => {
	const { limit } = req.params;
	try {
		const anime = await listAnimes(null, parseInt(limit));
		res.json({ success: true, anime });
	} catch (err) {
		console.error('GET /api/anime/recent/:limit error', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// endpoint que devuelve todos los animes de un género específico
app.get('/api/anime/genre/:genreId', async (req, res) => {
	const { genreId } = req.params;
	try {
		const anime = await listAnimes(genreId);
		res.json({ success: true, anime });
	} catch (err) {
		console.error('GET /api/anime/genre/:genreId error', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// endpoint que devuelve animes con limite de un genero específico
app.get('/api/anime/genre/:genreId/:limit', async (req, res) => {
	const { genreId, limit } = req.params;
	try {
		const anime = await listAnimes(genreId, limit);
		res.json({ success: true, anime });
	} catch (err) {
		console.error('GET /api/anime/genre/:genreId/:limit error', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// devolver un anime de la BBDD; si existe devolvemos inmediatamente
// y lanzamos la sincronización en segundo plano. solo esperamos si
// no está presente todavía.
app.get('/api/anime/:id', async (req, res) => {
	const { id } = req.params;
	try {
		console.log('GET /api/anime/:id', id);
		// always start by reading whatever is currently in the database
		let anime = await findAnimeById(id);
		console.log('  initial db read:', !!anime);
		if (anime) {
			// we enforce re-read just before sending so the response comes
			// strictly from the database, even if the `anime` variable is stale.
			anime = await findAnimeById(id);
			res.json({ success: true, anime });
			// schedule a full update in the background
			syncAnimeById(id).catch((e) => console.error('background sync error', e));
			return;
		}

		// not yet stored: fetch metadata and write it, then read from DB
		let rec;
		try {
			rec = await syncAnimeMetadataById(id);
			console.log('  metadata sync rec:', rec && rec.id_anime);
		} catch (e) {
			console.error('metadata sync error', e);
			// try a direct fetch from Jikan so we at least have some data
			try {
				const r = await axios.get(`https://api.jikan.moe/v4/anime/${id}/full`);
				if (r.data && r.data.data) {
					rec = mapJikanToDb(r.data.data);
				}
			} catch (e2) {
				console.error('direct Jikan fetch also failed', e2.message);
			}
		}
		anime = await findAnimeById(id); // attempt read from DB
		console.log('  post-sync db read:', !!anime);
		// if DB read fails but we do have the returned record, use it
		if (!anime && rec) {
			console.log('  using rec fallback');
			anime = rec;
		}
		if (!anime) {
			console.log('  final result: not found');
			return res.status(404).json({
				success: false,
				error: 'not found'
			});
		}
		res.json({ success: true, anime });
		// afterwards, fetch episodes without delaying the response
		syncAnimeById(id).catch((e) => console.error('background sync error', e));
	} catch (err) {
		console.error('GET /api/anime/:id error', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// ruta para forzar la sincronización manualmente
app.post('/api/anime/sync/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const rec = await syncAnimeById(id);
		res.json({ success: true, anime: rec });
	} catch (err) {
		console.error('POST /api/anime/sync/:id error', err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// Iniciar el servidor (arrancar la aplicación)
app.listen(PORT, () => {
	console.log(`Servidor escoltant a http://localhost:${PORT}`);
});
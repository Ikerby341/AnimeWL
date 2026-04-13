import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { randomUUID, randomBytes, scryptSync } from 'crypto';
import session from 'express-session';
import { syncAnimeById, syncAnimeMetadataById, mapJikanToDb } from './controllers/syncAnime.js';
import { findAnimeById, listAnimes, testDbConnection } from './models/anime_model.js';
import { registerUser, findUserByNom, updateUserProfilePicture, updateUserAnimeChoice } from './models/users_model.js';

function hashPassword(password) {
	const salt = randomBytes(16).toString('hex');
	const hashed = scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hashed}`;
}

function validateEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
const __filename = fileURLToPath(import.meta.url);	// Ruta d'aquest arxiu (servidor.js)
const __dirname = path.dirname(__filename);			// Ruta de la carpeta on es troba aquest arxiu

const app = express();
const PORT = 3000;

// Middleware para convertir JSON
app.use(express.json());
// permitir peticiones desde el cliente React en desarrollo
app.use(cors({
	origin: ['http://localhost:5173'],
	credentials: true
}));

// Configuración de sesiones
app.use(session({
	secret: process.env.SESSION_SECRET || 'tu_secreto_super_seguro',
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false, // false para desarrollo (HTTP), true para producción (HTTPS)
		httpOnly: true,
		maxAge: 60 * 60 * 1000 // 1 hora por defecto
	}
}));

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
	const { data, error } = await testDbConnection();

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
	const cacheOnly = req.query.cacheOnly === 'true';
	try {
		console.log('GET /api/anime/:id', id, 'cacheOnly=', cacheOnly);
		// always start by reading whatever is currently in the database
		let anime = await findAnimeById(id);
		console.log('  initial db read:', !!anime);
		if (anime) {
			anime = await findAnimeById(id);
			res.json({ success: true, anime });
			if (!cacheOnly) {
				syncAnimeById(id).catch((e) => console.error('background sync error', e));
			}
			return;
		}

		if (cacheOnly) {
			console.log('  cacheOnly requested and anime not in DB. returning 404 without sync.');
			return res.status(404).json({ success: false, error: 'not found' });
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

// registro de usuario
app.post('/api/register', async (req, res) => {
	const { nom, email, contrasenya } = req.body;

	if (!nom || !email || !contrasenya) {
		return res.status(400).json({ success: false, error: 'Faltan datos de registro.' });
	}
	if (!validateEmail(email)) {
		return res.status(400).json({ success: false, error: 'El email no es válido.' });
	}
	if (contrasenya.length < 6) {
		return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
	}

	const hashedPassword = hashPassword(contrasenya);
	const id_usuari = randomUUID();

	const { data, error } = await registerUser({ id_usuari, nom, email, contrasenya: hashedPassword });

	if (error) {
		console.error('Supabase insert error:', error.message || error);
		const message = error.message || 'Error al registrar el usuario.';
		const status = message.includes('duplicate') || message.includes('unique') ? 409 : 500;
		return res.status(status).json({ success: false, error: message });
	}

	return res.status(201).json({ success: true, user: { id_usuari, nom, email } });
});

app.post('/api/login', async (req, res) => {
	const { username, password, remember } = req.body;

	if (!username || !password) {
		return res.status(400).json({ success: false, error: 'Faltan datos de inicio de sesión.' });
	}

	const result = await findUserByNom(username);

	if (result.error) {
		console.error('Supabase login error:', result.error);
		return res.status(500).json({ success: false, error: 'Error al iniciar sesión.' });
	}

	if (!result.data) {
		return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos.' });
	}

	const storedPassword = result.data.contrasenya;
	const [salt, hashed] = storedPassword.split(':');
	const attemptHash = scryptSync(password, salt, 64).toString('hex');

	if (attemptHash !== hashed) {
		return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos.' });
	}

	// Guardar usuario en sesión
	req.session.user = {
		id_usuari: result.data.id_usuari,
		nom: result.data.nom,
		email: result.data.email,
		id_anime_preferit: result.data.id_anime_preferit,
		id_anime_recomanat: result.data.id_anime_recomanat,
		img_url: result.data.img_url
	};
	req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días

	return res.json({
		success: true,
		user: req.session.user
	});
});

// Verificar sesión actual
app.get('/api/session', async (req, res) => {
	if (!req.session.user) {
		return res.status(401).json({ success: false, error: 'No hay sesión activa' });
	}

	const sessionUser = req.session.user;

	if (sessionUser.id_anime_preferit == null || sessionUser.id_anime_recomanat == null || sessionUser.img_url == null) {
		try {
			const result = await findUserByNom(sessionUser.nom);
			if (result.error) {
				console.error('Error fetching user session info:', result.error);
				return res.status(500).json({ success: false, error: 'Error al comprobar la sesión' });
			}

			if (result.data) {
				req.session.user = {
					id_usuari: result.data.id_usuari,
					nom: result.data.nom,
					email: result.data.email,
					id_anime_preferit: result.data.id_anime_preferit,
					id_anime_recomanat: result.data.id_anime_recomanat,
					img_url: result.data.img_url
				};
				return res.json({ success: true, user: req.session.user });
			}
		} catch (error) {
			console.error('Error fetching session user info:', error);
			return res.status(500).json({ success: false, error: 'Error al comprobar la sesión' });
		}
	}

	return res.json({ success: true, user: sessionUser });
});

app.get('/api/check-session', async (req, res) => {
	if (!req.session.user) {
		return res.status(401).json({ success: false, error: 'No hay sesión activa' });
	}
	// refrescar datos de sesión desde la base de datos para asegurarnos de que tenemos la info más reciente
	try {
		const result = await findUserByNom(req.session.user.nom);
		if (result.error) {
			console.error('Error fetching session user info:', result.error);
			return res.status(500).json({ success: false, error: 'Error al comprobar la sesión' });
		}
		if (result.data) {
			req.session.user = {
				id_usuari: result.data.id_usuari,
				nom: result.data.nom,
				email: result.data.email,
				id_anime_preferit: result.data.id_anime_preferit,
				id_anime_recomanat: result.data.id_anime_recomanat,
				img_url: result.data.img_url
			};
		}
	} catch (error) {
		console.error('Error fetching session user info:', error);
		return res.status(500).json({ success: false, error: 'Error al comprobar la sesión' });
	}


	return res.json({ success: true, user: req.session.user });
});

app.post('/api/user/anime', async (req, res) => {
	const { type, id_anime } = req.body;
	if (!req.session.user) {
		return res.status(401).json({ success: false, error: 'No hay sesión activa' });
	}
	if (!['favorite', 'recommended'].includes(type)) {
		return res.status(400).json({ success: false, error: 'Tipo inválido. Usa favorite o recommended.' });
	}
	if (!id_anime) {
		return res.status(400).json({ success: false, error: 'Falta el id del anime.' });
	}

	const field = type === 'favorite' ? 'id_anime_preferit' : 'id_anime_recomanat';
	try {
		let anime = await findAnimeById(id_anime);
		if (!anime) {
			console.log(`Anime ${id_anime} no encontrado en BBDD, sincronizando antes de asignar.`);
			await syncAnimeMetadataById(id_anime);
			anime = await findAnimeById(id_anime);
			if (!anime) {
				return res.status(500).json({ success: false, error: 'No se pudo sincronizar el anime seleccionado.' });
			}
		}

		const { data, error } = await updateUserAnimeChoice(req.session.user.id_usuari, field, id_anime);
		if (error) {
			console.error('Error updating user anime choice:', error);
			return res.status(500).json({ success: false, error: 'Error al actualizar el anime del usuario' });
		}
		if (!data) {
			return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
		}
		return res.json({ success: true, user: data });
	} catch (error) {
		console.error('POST /api/user/anime error', error);
		return res.status(500).json({ success: false, error: error.message });
	}
});

// Logout
app.post('/api/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error('Error destroying session:', err);
			return res.status(500).json({ success: false, error: 'Error al cerrar sesión' });
		}
		res.clearCookie('connect.sid');
		return res.json({ success: true, message: 'Sesión cerrada correctamente' });
	});
});

app.post('/api/update-profile-picture', async (req, res) => {
	const { img_url } = req.body;
	if (!req.session.user) {
		return res.status(401).json({ success: false, error: 'No hay sesión activa' });
	}
	if (!img_url || typeof img_url !== 'string' || !/^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(img_url)) {
		return res.status(400).json({ success: false, error: 'URL de imagen no válida' });
	}
	try {
		const { data, error } = await updateUserProfilePicture(req.session.user.id_usuari, img_url);

		if (error) {
			console.error('Error updating profile picture:', error);
			return res.status(500).json({ success: false, error: 'Error al actualizar la foto de perfil' });
		}

		if (!data) {
			return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
		}

		return res.json({ success: true, user: data });
	} catch (error) {
		console.error('Error updating profile picture:', error);
		return res.status(500).json({ success: false, error: 'Error al actualizar la foto de perfil' });
	}
});

// Iniciar el servidor (arrancar la aplicación)
app.listen(PORT, () => {
	console.log(`Servidor escoltant a http://localhost:${PORT}`);
});
import axios from 'axios';
import { upsertAnime, upsertAnimeGenres, upsertChapters } from '../models/anime_model.js';

// ayuda para obtener una página de anime de Jikan
async function fetchAnimePage(page = 1) {
    const url = `https://api.jikan.moe/v4/anime?page=${page}`;
    let attempts = 0;
    while (true) {
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (err) {
            if (err.response && err.response.status === 429) {
                // limitado por tasa, retrocede y reintenta
                attempts++;
                const delay = Math.min(1000 * 2 ** attempts, 30000);
                console.warn(`rate limit hit, waiting ${delay}ms`);
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }
}

// convertir objeto anime de Jikan a nuestro formato de BD
// también devolver array de géneros que se sincronizará por separado
export function mapJikanToDb(anime) {
    return {
        id_anime: anime.mal_id.toString(),
        titol: anime.title,
        sinopsi: anime.synopsis,
        estat: anime.status,
        imatge_portada: anime.images?.jpg?.image_url || anime.image_url,
        dataafegit: anime.aired?.from || null,
        lastupdate: anime.updated_at || new Date().toISOString(),
        genres: anime.genres ? anime.genres.map((g) => g.name) : [],
    };
}

async function fetchJikanJson(url) {
    let attempts = 0;
    while (true) {
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (err) {
            const status = err.response?.status;
            if (status === 429) {
                attempts += 1;
                const delay = Math.min(1000 * 2 ** attempts, 30000);
                console.warn(`rate limit hit when fetching ${url}, waiting ${delay}ms`);
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }
            if (status >= 500) {
                console.error(`Jikan server error ${status} for ${url}`);
                return null;
            }
            throw err;
        }
    }
}

// obtener lista completa de episodios para un anime (puede paginarse)
async function fetchEpisodes(animeId) {
    const episodes = [];
    let page = 1;
    while (true) {
        const url = `https://api.jikan.moe/v4/anime/${animeId}/episodes?page=${page}`;
        let res;
        let attempts = 0;
        const json = await fetchJikanJson(url);
        if (!json || !json.data) break;
        const d = json;
        if (!d || !d.data || d.data.length === 0) break;
        episodes.push(...d.data);
        if (!d.pagination.has_next_page) break;
        page++;
    }
    return episodes;
}

// helper que sincroniza sólo la información básica (sin capítulos)
export async function syncAnimeMetadataById(idAnime) {
    if (!idAnime) return;
    const url = `https://api.jikan.moe/v4/anime/${idAnime}/full`;
    const json = await fetchJikanJson(url);
    const data = json?.data;
    if (!data) return null;

    const record = mapJikanToDb(data);
    await upsertAnime(record);
    if (record.genres && record.genres.length > 0) {
        await upsertAnimeGenres(record.id_anime, record.genres);
    }
    return record;
}

// export helper to synchronise a single anime by id
export async function syncAnimeById(idAnime) {
    if (!idAnime) return;
    // llamamos al endpoint de detalle de Jikan para obtener toda la información
    const url = `https://api.jikan.moe/v4/anime/${idAnime}/full`;
    const json = await fetchJikanJson(url);
    const data = json?.data;
    if (!data) return null;

    const record = mapJikanToDb(data);
    await upsertAnime(record);
    if (record.genres && record.genres.length > 0) {
        await upsertAnimeGenres(record.id_anime, record.genres);
    }
    try {
        const eps = await fetchEpisodes(record.id_anime);
        if (eps.length) {
            await upsertChapters(record.id_anime, eps);
        }
    } catch (err) {
        console.error('episode fetch error', err.message);
    }
    return record;
}

// función principal de sincronización
export async function syncAllAnime() {
    console.log('Starting anime synchronization');
    let page = 1;
    let pagesTotales = null;

    while (true) {
        const t0 = Date.now();
        try {
            const data = await fetchAnimePage(page);
            if (!data || !data.data || data.data.length === 0) break;

            // capturar número total de páginas desde la paginación en la primera ejecución
            if (pagesTotales === null && data.pagination?.last_visible_page) {
                pagesTotales = data.pagination.last_visible_page;
            }

            // procesar algunos animes de esta página de forma concurrente; manejamos sus
            // episodios más lentamente para evitar alcanzar los límites de tasa.
            const concurrency = 2;
            for (let i = 0; i < data.data.length; i += concurrency) {
                const chunk = data.data.slice(i, i + concurrency);
                await Promise.all(
                    chunk.map(async (anime) => {
                        const record = mapJikanToDb(anime);
                        await upsertAnime(record);

                        // sincronizar géneros
                        if (record.genres && record.genres.length > 0) {
                            await upsertAnimeGenres(record.id_anime, record.genres);
                        }

                        // sincronizar capítulos/episodios
                        try {
                            const eps = await fetchEpisodes(record.id_anime);
                            if (eps.length) {
                                await upsertChapters(record.id_anime, eps);
                            }
                        } catch (err) {
                            console.error('episode fetch error', err.message);
                        }
                    })
                );
                // pequeña pausa entre grupos de animes para dar al endpoint de detalles
                // un poco de espacio para respirar
                await new Promise((r) => setTimeout(r, 2000));
            }

            const t1 = Date.now();
            const elapsed = (t1 - t0) / 1000;
            if (pagesTotales) {
                const remainingSec = (pagesTotales - page) * elapsed;
                console.log(
                    `page ${page} processed in ${elapsed.toFixed(1)}s; ` +
                    `≈${(remainingSec / 60).toFixed(1)}m remaining`
                );
            } else {
                console.log(`page ${page} processed in ${elapsed.toFixed(1)}s`);
            }

            if (!data.pagination.has_next_page) break;
            page += 1;
            // continuar hasta la última página. eliminar límite duro anterior para obtener todos los animes.
        } catch (err) {
            console.error('fetch page error', err.message);
            break;
        }
    }
    console.log('Anime synchronization finished');
}

// también exportar un disparador manual
export default syncAllAnime;
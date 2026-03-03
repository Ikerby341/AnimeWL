import cron from 'node-cron';
import axios from 'axios';
import { upsertAnime } from './models/anime_model.js';

// helper to fetch a page of anime from Jikan
async function fetchAnimePage(page = 1) {
    const url = `https://api.jikan.moe/v4/anime?page=${page}`;
    const res = await axios.get(url);
    return res.data;
}

// convert jikan anime object to our db shape
function mapJikanToDb(anime) {
    return {
        id_anime: anime.mal_id.toString(),
        titol: anime.title,
        sinopsi: anime.synopsis,
        estat: anime.status,
        imatge_portada: anime.images?.jpg?.image_url || anime.image_url,
        dataafegit: anime.aired?.from || null,
        lastupdate: anime.updated_at || new Date().toISOString(),
    };
}

// main sync function
export async function syncAllAnime() {
    console.log('Starting anime synchronization');
    let page = 1;
    while (true) {
        try {
            const data = await fetchAnimePage(page);
            if (!data || !data.data || data.data.length === 0) break;
            for (const anime of data.data) {
                const record = mapJikanToDb(anime);
                await upsertAnime(record);
            }
            if (!data.pagination.has_next_page) break;
            page += 1;
            // continue until last page. remove previous hard limit to fetch all animes.
        } catch (err) {
            console.error('fetch page error', err.message);
            break;
        }
    }
    console.log('Anime synchronization finished');
}

// schedule at 23:00 every day
cron.schedule('0 23 * * *', () => {
    syncAllAnime().catch(console.error);
});

// also export a manual trigger
export default syncAllAnime;
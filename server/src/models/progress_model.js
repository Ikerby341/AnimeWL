import { randomUUID } from 'crypto';
import supabase from '../config/db.js';

export async function findProgressByAnimeAndUser(id_anime, id_usuari) {
    if (!id_anime || !id_usuari) return null;

    const { data, error } = await supabase
        .from('progres')
        .select('id_progres, id_usuari, id_anime, capitols_vistos, minuts_totals')
        .eq('id_anime', id_anime)
        .eq('id_usuari', id_usuari)
        .maybeSingle();

    if (error) {
        console.error('findProgressByAnimeAndUser error', error);
        throw error;
    }

    return data || null;
}

export async function saveProgress(progress) {
    const { id_usuari, id_anime, capitols_vistos, minuts_totals } = progress;
    if (!id_usuari || !id_anime || capitols_vistos == null) {
        throw new Error('Faltan datos de progreso');
    }

    const existing = await supabase
        .from('progres')
        .select('id_progres')
        .eq('id_usuari', id_usuari)
        .eq('id_anime', id_anime)
        .maybeSingle();

    if (existing.error) {
        console.error('saveProgress existing lookup error', existing.error);
        throw existing.error;
    }

    if (existing.data) {
        const { data: updated, error } = await supabase
            .from('progres')
            .update({ capitols_vistos, minuts_totals })
            .eq('id_progres', existing.data.id_progres)
            .select()
            .maybeSingle();

        if (error) {
            console.error('saveProgress update error', error);
            throw error;
        }

        return updated;
    }

    const id_progres = progress.id_progres || randomUUID();
    const { data: inserted, error } = await supabase
        .from('progres')
        .insert({
            id_progres,
            id_usuari,
            id_anime,
            capitols_vistos,
            minuts_totals: minuts_totals || 0
        })
        .select()
        .maybeSingle();

    if (error) {
        console.error('saveProgress insert error', error);
        throw error;
    }

    return inserted;
}

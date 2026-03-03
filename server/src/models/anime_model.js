import supabase from '../config/db.js';

const KEYS_TO_COMPARE = ['titol', 'sinopsi', 'estat', 'imatge_portada', 'dataAfegit'];

export async function findAnimeById(id_anime) {
    const { data, error } = await supabase
        .from('anime')
        .select('*')
        .eq('id_anime', id_anime)
        .single();
    if (error && error.code !== 'PGRST116') {
        throw error;
    }
    return data || null;
}

export async function insertAnime(record) {
    const { error } = await supabase.from('anime').insert(record);
    if (error) throw error;
    return record;
}

export async function updateAnime(id_anime, record) {
    const { error } = await supabase
        .from('anime')
        .update(record)
        .eq('id_anime', id_anime);
    if (error) throw error;
    return record;
}

export async function upsertAnime(record) {
    let existing;
    try {
        existing = await findAnimeById(record.id_anime);
    } catch (err) {
        console.error('select anime error', err);
        return;
    }

    if (!existing) {
        try {
            await insertAnime(record);
        } catch (err) {
            console.error('insert error', err);
        }
        return;
    }

    // compare fields to determine if update needed
    let changed = false;
    for (const k of KEYS_TO_COMPARE) {
        if ((existing[k] || '') !== (record[k] || '')) {
            changed = true;
            break;
        }
    }
    if (changed) {
        record.lastUpdate = new Date().toISOString();
        try {
            await updateAnime(record.id_anime, record);
        } catch (err) {
            console.error('update error', err);
        }
    }
}
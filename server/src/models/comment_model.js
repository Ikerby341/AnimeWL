import supabase from '../config/db.js';

export async function findCommentsByAnimeId(id_anime) {
    if (!id_anime) return [];

    const { data, error } = await supabase
        .from('comentari')
        .select('id_comentari, id_usuari, id_anime, id_capitol, contingut, data_hora, usuari(nom, img_url)')
        .eq('id_anime', id_anime)
        .order('data_hora', { ascending: false });

    if (error) {
        console.error('findCommentsByAnimeId error', error);
        throw error;
    }

    return (data || []).map((comment) => ({
        ...comment,
        userName: comment.usuari?.nom || 'Anónimo',
        userImg: comment.usuari?.img_url || null,
    }));
}

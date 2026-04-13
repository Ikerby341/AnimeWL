import supabase from './../config/db.js';

export async function registerUser({ id_usuari, nom, email, contrasenya }) {
    let result = await supabase.from('usuari').select('nom').eq('nom', nom).maybeSingle();

    if (result.error) {
        console.error('Error checking username uniqueness:', result.error);
        return { data: null, error: result.error };
    }
    if (result.data) {
        const message = 'Ese nombre de usuario ya está registrado.';
        console.log(message, nom);
        return { data: null, error: new Error(message) };
    }

    result = await supabase.from('usuari').select('email').eq('email', email).maybeSingle();

    if (result.error) {
        console.error('Error checking email uniqueness:', result.error);
        return { data: null, error: result.error };
    }
    if (result.data) {
        const message = 'Ese email ya está registrado.';
        console.log(message, email);
        return { data: null, error: new Error(message) };
    }

    const { data, error } = await supabase.from('usuari').insert([
        {
            id_usuari,
            nom,
            email,
            contrasenya,
            id_anime_preferit: null,
            id_anime_recomanat: null,
            img_url: null
        }
    ]);

    if (error) {
        console.error('Error registrando el usuario:', error);
    }

    return { data, error };
}

export async function findUserByNom(nom) {
    return await supabase
        .from('usuari')
        .select('id_usuari, nom, email, contrasenya, id_anime_preferit, id_anime_recomanat, img_url')
        .eq('nom', nom)
        .maybeSingle();
}

export async function findUserByEmail(email) {
    return await supabase
        .from('usuari')
        .select('id_usuari, nom, email, contrasenya, id_anime_preferit, id_anime_recomanat, img_url')
        .eq('email', email)
        .maybeSingle();
}

export async function updateUserProfilePicture(id_usuari, img_url) {
    return await supabase
        .from('usuari')
        .update({ img_url })
        .eq('id_usuari', id_usuari)
        .select()
        .maybeSingle();
}

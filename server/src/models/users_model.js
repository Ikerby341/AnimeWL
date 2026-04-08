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
            id_anime_recomanat: null
        }
    ]);

    if (error) {
        console.error('Error registrando el usuario:', error);
    }

    return { data, error };
}
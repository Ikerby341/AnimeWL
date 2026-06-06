import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext.js';
import { netejarTokenAutenticacio, definirTokenAutenticacio } from '../utils/authTokenFetch.js';

function ProveidorAutenticacio({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesion al cargar la aplicacion
  useEffect(() => {
    comprovarSessio();
  }, []);

  const comprovarSessio = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/session`, {
        credentials: 'include'
      });

      if (response.status === 401) {
        netejarTokenAutenticacio();
        setUser(null);
      } else if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          if (data.token) definirTokenAutenticacio(data.token);
          setUser(data.user);
        } else {
          netejarTokenAutenticacio();
          setUser(null);
        }
      } else {
        console.error('Error checking session:', response.status);
        netejarTokenAutenticacio();
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      netejarTokenAutenticacio();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const iniciarSessio = async (username, password, remember = false) => {
    const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ username, password, remember })
    });

    const data = await response.json();

    if (data.success) {
      if (data.token) definirTokenAutenticacio(data.token);
      setUser(data.user);
    } else {
      netejarTokenAutenticacio();
    }

    return data;
  };

  const tancarSessio = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKENDURL}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      netejarTokenAutenticacio();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      netejarTokenAutenticacio();
      setUser(null);
    }
  };

  const obtenirDadesUsuari = () => {
    if (!user) return null;

    return {
      nom: user.nom ?? '',
      email: user.email ?? '',
      id_anime_preferit: user.id_anime_preferit ?? null,
      id_anime_recomanat: user.id_anime_recomanat ?? null,
      img_url: user.img_url ?? null,
      isAdmin: user.isAdmin === true
    };
  };

  const isLoggedIn = Boolean(user);

  const value = {
    user,
    loading,
    login: iniciarSessio,
    logout: tancarSessio,
    checkSession: comprovarSessio,
    isLoggedIn,
    getUserInfo: obtenirDadesUsuari
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>);

}export { ProveidorAutenticacio };
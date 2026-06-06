import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { BarraNavegacio } from '../components/NavBar/NavBar.jsx';
import { Perfil } from '../components/Perfil/Perfil.jsx';
import PeuPagina from '../components/Footer/Footer.jsx';
import { useAutenticacio } from '../hooks/useAuth.js';
import '../components/ProfilePage/ProfilePage.css';

function obtenirIdUsuari(user) {
  return user?.id_usuari || user?.id_usuario || user?.id_user || user?.userId || user?.id || null;
}

async function carregarPerfilPublic(userId) {
  const endpoints = [
  `/api/user/${userId}/public`,
  `/api/users/${userId}/public`,
  `/api/profile/${userId}`,
  `/api/user/${userId}`];


  for (const endpoint of endpoints) {
    const response = await fetch(`${import.meta.env.VITE_BACKENDURL}${endpoint}`, {
      credentials: 'include'
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok && (data.success || data.user || data.profile)) {
      return data.user || data.profile || data;
    }
  }

  throw new Error('No se pudo cargar el perfil.');
}

async function carregarFavoritsPublics(userId) {
  const endpoints = [
  `/api/user/${userId}/favorites/public`,
  `/api/users/${userId}/favorites/public`,
  `/api/profile/${userId}/favorites`,
  `/api/user/${userId}/favorites`];


  for (const endpoint of endpoints) {
    const response = await fetch(`${import.meta.env.VITE_BACKENDURL}${endpoint}`, {
      credentials: 'include'
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok && (data.success || data.favorites)) {
      return data.favorites || [];
    }
  }

  return [];
}

function PerfilPublic() {
  const { userId } = useParams();
  const { user, loading: authLoading } = useAutenticacio();
  const [profileUser, setProfileUser] = useState(null);
  const [profileFavorites, setProfileFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ownUserId = obtenirIdUsuari(user);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    async function loadPublicProfile() {
      setLoading(true);
      setError('');

      try {
        const [publicUser, publicFavorites] = await Promise.all([
        carregarPerfilPublic(userId),
        carregarFavoritsPublics(userId)]
        );

        if (!cancelled) {
          setProfileUser(publicUser);
          setProfileFavorites(publicFavorites);
        }
      } catch (err) {
        console.error('fetch public profile error', err);
        if (!cancelled) {
          setError('No se pudo cargar este perfil.');
          setProfileUser(null);
          setProfileFavorites([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (userId) {
      loadPublicProfile();
    }

    return () => {cancelled = true;};
  }, [userId]);

  if (!authLoading && ownUserId && String(ownUserId) === String(userId)) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <BarraNavegacio searchBar={false} />
            <div className="profile-page public-profile-page">
                <div className="profile-content public-profile-content">
                    {loading && <p className="public-profile-message">Cargando perfil...</p>}
                    {!loading && error && <p className="public-profile-message">{error}</p>}
                    {!loading && profileUser &&
          <Perfil profileUser={profileUser} profileFavorites={profileFavorites} readOnly hideEmail />
          }
                </div>
            </div>
            <PeuPagina />
        </div>);

}export { PerfilPublic as default };
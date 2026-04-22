import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsLoggedIn } from '../hooks/useAuth';
import { Navbar } from '../components/NavBar/NavBar.jsx';
import Footer from '../components/Footer/Footer.jsx';
import '../styles/favorites.css'

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isLoggedIn = useIsLoggedIn();

  const handleSelectAnime = (anime) => {
    const id = anime.id_anime || anime.id;
    if (id) {
      navigate(`/details/${id}`);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const loadFavorites = async () => {
      setLoading(true);
      setError('');
      try {
        const r = await fetch(`/api/user/favorites`, { credentials: 'include' });
        const data = await r.json();
        if (data && data.success) {
          setFavorites(data.favorites || []);
        } else {
          setError(data.error || 'Error al cargar favoritos');
        }
      } catch (err) {
        console.error('fetch favorites error', err);
        setError('Error al cargar favoritos');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [isLoggedIn]);

  const handleRemoveFavorite = async (id_anime) => {
    try {
      const response = await fetch(`/api/user/favorites/${id_anime}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error('remove favorite error', data.error);
        return;
      }
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id_anime !== id_anime));
    } catch (err) {
      console.error('remove favorite error', err);
    }
  };

  const handleStatusChange = async (e, id_anime) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    try {
      const response = await fetch(`/api/user/favorites/${id_anime}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estat: newStatus })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error('update favorite status error', data.error);
        return;
      }
      // Actualizar el estado local
      setFavorites(prevFavorites =>
        prevFavorites.map(fav =>
          fav.id_anime === id_anime ? { ...fav, estat: newStatus } : fav
        )
      );
    } catch (err) {
      console.error('update favorite status error', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Navbar favorites={false} />
      <div className="content">
        <h1 className="favorites-title">FAVORITOS</h1>
        
        {!isLoggedIn && (
          <p className="not-logged-in">Por favor, inicia sesión para ver tus favoritos.</p>
        )}
        
        {isLoggedIn && loading && (
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        )}

        {isLoggedIn && error && (
          <p className="error-message">{error}</p>
        )}

        {isLoggedIn && !loading && favorites.length === 0 && (
          <p className="no-favorites">No tienes favoritos aún. ¡Añade algunos!</p>
        )}

        {isLoggedIn && !loading && favorites.length > 0 && (
          <div className="favorites-grid">
            {favorites.map((favorite, index) => {
              const anime = favorite.anime;
              if (!anime) return null;

              return (
                <div key={`${favorite.id_anime}-${index}`} className="favorite-card" onClick={() => handleSelectAnime(anime)}>
                  <div className="favorite-card-image-container">
                    <img 
                      src={anime.imatge_portada || ''} 
                      alt={anime.titol}
                      className="favorite-card-image"
                    />
                  </div>
                  <div className="favorite-card-info">
                    <div>
                      <h3 className="favorite-card-title">{anime.titol}</h3>
                      <p className="favorite-card-episode">
                        Cap. {favorite.capitols_vistos}
                      </p>
                      <select
                        className="favorite-card-status"
                        value={favorite.estat || 'Por ver'}
                        onChange={(e) => handleStatusChange(e, favorite.id_anime)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="Por ver">Por ver</option>
                        <option value="Viendo">Viendo</option>
                        <option value="Finalizado">Finalizado</option>
                      </select>
                    </div>
                    <div className="favorite-card-rating">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={`star ${i <= Math.round(anime.rating?.average || 0) ? 'filled' : ''}`}>★</span>
                      ))}
                    </div>
                    <button 
                      className="favorite-card-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(favorite.id_anime);
                      }}
                      title="Eliminar de favoritos"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
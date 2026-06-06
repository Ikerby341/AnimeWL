import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter } from 'react-icons/fi';
import { useEstaConnectat } from '../hooks/useAuth';
import { BarraNavegacio } from '../components/NavBar/NavBar.jsx';
import PeuPagina from '../components/Footer/Footer.jsx';
import { IconaPaperera } from '../components/Icons/Icons.jsx';
import '../styles/directory.css';
import '../styles/favorites.css';

function formatarNomGenere(genre) {
  return String(genre).
  replace(/[_-]+/g, ' ').
  replace(/\s+/g, ' ').
  trim().
  replace(/\b\w/g, (char) => char.toUpperCase());
}

function obtenirValorGenere(genre) {
  if (!genre) {
    return '';
  }

  if (typeof genre === 'object') {
    return String(genre.id_genere ?? genre.id ?? genre.nom ?? genre.name ?? '');
  }

  return String(genre);
}

function obtenirEtiquetaGenere(genre) {
  if (!genre) {
    return '';
  }

  if (typeof genre === 'object') {
    return formatarNomGenere(genre.nom ?? genre.name ?? genre.id_genere ?? genre.id ?? '');
  }

  return formatarNomGenere(genre);
}

function Favorits() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isLoggedIn = useEstaConnectat();
  const statusOptions = ['Por ver', 'Viendo', 'Finalizado'];

  const availableGenres = useMemo(() => {
    const genreMap = new Map();

    favorites.forEach((favorite) => {
      const genres = Array.isArray(favorite.anime?.genres) ? favorite.anime.genres : [];

      genres.forEach((genre) => {
        const value = obtenirValorGenere(genre);

        if (!value || genreMap.has(value)) {
          return;
        }

        genreMap.set(value, {
          value,
          label: obtenirEtiquetaGenere(genre)
        });
      });
    });

    return Array.from(genreMap.values()).sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [favorites]);

  const filteredFavorites = useMemo(() =>
  favorites.filter((favorite) => {
    const matchesGenre = !selectedGenre ||
    Array.isArray(favorite.anime?.genres) &&
    favorite.anime.genres.some((genre) => obtenirValorGenere(genre) === selectedGenre);


    const matchesStatus = !selectedStatus || (favorite.estat || 'Por ver') === selectedStatus;

    return matchesGenre && matchesStatus;
  }),
  [favorites, selectedGenre, selectedStatus]);

  const seleccionarAnimeFavorit = (anime) => {
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
        const r = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/favorites`, { credentials: 'include' });
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

  useEffect(() => {
    if (!selectedGenre) {
      return;
    }

    const genreStillAvailable = availableGenres.some((genre) => genre.value === selectedGenre);

    if (!genreStillAvailable) {
      setSelectedGenre('');
    }
  }, [availableGenres, selectedGenre]);

  const eliminarFavorit = async (id_anime) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/favorites/${id_anime}`, {
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
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id_anime !== id_anime));
    } catch (err) {
      console.error('remove favorite error', err);
    }
  };

  const canviarEstatFavorit = async (e, id_anime) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/favorites/${id_anime}`, {
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
      setFavorites((prevFavorites) =>
      prevFavorites.map((fav) =>
      fav.id_anime === id_anime ? { ...fav, estat: newStatus } : fav
      )
      );
    } catch (err) {
      console.error('update favorite status error', err);
    }
  };

  const gestionarTeclaTargeta = (event, anime) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      seleccionarAnimeFavorit(anime);
    }
  };

  const renderitzarControlsFiltre = () =>
  <>
      <label className="directory-filter-label" htmlFor="favorites-genre-select">
        Género
      </label>
      <select
      id="favorites-genre-select"
      className="directory-filter-select"
      value={selectedGenre}
      onChange={(event) => setSelectedGenre(event.target.value)}>
      
        <option value="">Todos</option>
        {availableGenres.map((genre) =>
      <option key={genre.value} value={genre.value}>
            {genre.label}
          </option>
      )}
      </select>

      <label className="directory-filter-label" htmlFor="favorites-status-select">
        Estado
      </label>
      <select
      id="favorites-status-select"
      className="directory-filter-select"
      value={selectedStatus}
      onChange={(event) => setSelectedStatus(event.target.value)}>
      
        <option value="">Todos</option>
        {statusOptions.map((status) =>
      <option key={status} value={status}>
            {status}
          </option>
      )}
      </select>
    </>;


  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <BarraNavegacio favorites={false} />
      <div className="content">
        <h1 className="favorites-title">FAVORITOS</h1>

        {!isLoggedIn &&
        <p className="not-logged-in">Por favor, inicia sesion para ver tus favoritos.</p>
        }

        {isLoggedIn && loading &&
        <div className="loading-container">
            <div className="loader"></div>
          </div>
        }

        {isLoggedIn && error &&
        <p className="error-message">{error}</p>
        }

        {isLoggedIn && !loading && favorites.length === 0 &&
        <p className="no-favorites">No tienes favoritos aun. Anade algunos.</p>
        }

        {isLoggedIn && !loading && favorites.length > 0 &&
        <>
            <div className="directory-filters favorites-filters favorites-filters-desktop">
              {renderitzarControlsFiltre()}
            </div>

            <div className="favorites-filters-mobile">
              <button
              type="button"
              className="favorites-filter-toggle"
              onClick={() => setMobileFiltersOpen((current) => !current)}
              aria-expanded={mobileFiltersOpen}
              aria-controls="favorites-mobile-filters">
              
                <FiFilter size={18} />
                <span>Filtros</span>
              </button>

              {mobileFiltersOpen &&
            <div
              id="favorites-mobile-filters"
              className="directory-filters favorites-filters favorites-filters-panel">
              
                  {renderitzarControlsFiltre()}
                </div>
            }
            </div>

            {filteredFavorites.length === 0 ?
          <p className="no-favorites">No tienes favoritos con los filtros seleccionados.</p> :

          <div className="favorites-grid">
                {filteredFavorites.map((favorite, index) => {
              const anime = favorite.anime;
              if (!anime) return null;

              return (
                <div
                  key={`${favorite.id_anime}-${index}`}
                  className="favorite-card"
                  onClick={() => seleccionarAnimeFavorit(anime)}
                  onKeyDown={(event) => gestionarTeclaTargeta(event, anime)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Abrir anime ${anime.titol}`}>
                  
                      <div className="favorite-card-image-container">
                        <img
                      src={anime.imatge_portada || ''}
                      alt={anime.titol}
                      className="favorite-card-image" />
                    
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
                        onChange={(e) => canviarEstatFavorit(e, favorite.id_anime)}
                        onClick={(e) => e.stopPropagation()}>
                        
                            <option value="Por ver">Por ver</option>
                            <option value="Viendo">Viendo</option>
                            <option value="Finalizado">Finalizado</option>
                          </select>
                        </div>
                        <div className="favorite-card-rating">
                          {[1, 2, 3, 4, 5].map((i) =>
                      <span key={i} className={`star ${i <= Math.round(anime.rating?.average || 0) ? 'filled' : ''}`}>{'\u2605'}</span>
                      )}
                        </div>
                        <button
                      className="favorite-card-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarFavorit(favorite.id_anime);
                      }}
                      title="Eliminar de favoritos"
                      aria-label="Eliminar de favoritos">
                      
                          <IconaPaperera size={17} />
                        </button>
                      </div>
                    </div>);

            })}
              </div>
          }
          </>
        }
      </div>
      <PeuPagina />
    </div>);

}export { Favorits as default };
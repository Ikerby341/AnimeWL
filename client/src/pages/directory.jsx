import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter } from 'react-icons/fi';
import { BarraNavegacio } from '../components/NavBar/NavBar.jsx';
import { CobertaAnime } from '../components/AnimeCover/AnimeCover.jsx';
import PeuPagina from '../components/Footer/Footer.jsx';
import '../styles/directory.css';

const PAGE_SIZE = 16;
const MIN_STARS = 0;
const MAX_STARS = 5;

function obtenirIdAnime(anime) {
  return anime?.id_anime || anime?.id || '';
}

function obtenirAnimesUnics(list) {
  const seenIds = new Set();

  return list.filter((anime) => {
    const id = obtenirIdAnime(anime);
    if (!id) {
      return true;
    }

    if (seenIds.has(id)) {
      return false;
    }

    seenIds.add(id);
    return true;
  });
}

function Directori() {
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const [animes, setAnimes] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minRating, setMinRating] = useState(MIN_STARS);
  const [maxRating, setMaxRating] = useState(MAX_STARS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  function seleccionarAnime(anime) {
    const id = anime.id_anime || anime.id;
    if (id) {
      navigate(`/details/${id}`);
    }
  }

  const carregarAnimes = useCallback(async (
  offset = 0,
  genre = selectedGenre,
  ratingMin = minRating,
  ratingMax = maxRating) =>
  {
    const isFirstPage = offset === 0;

    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      setError('');
      const genreQuery = genre ? `&genre=${encodeURIComponent(genre)}` : '';
      const ratingQuery = `&minRating=${ratingMin}&maxRating=${ratingMax}`;
      const res = await fetch(
        `${import.meta.env.VITE_BACKENDURL}/api/anime?limit=${PAGE_SIZE}&offset=${offset}${genreQuery}${ratingQuery}`
      );

      if (!res.ok) {
        throw new Error('failed to fetch');
      }

      const body = await res.json();
      const list = body.anime || [];

      setAnimes((current) =>
      isFirstPage ? obtenirAnimesUnics(list) : obtenirAnimesUnics([...current, ...list])
      );
      setHasMore(Boolean(body.hasMore));
    } catch (err) {
      console.error('load animes error', err);
      setError('No se pudieron cargar los animes.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [maxRating, minRating, selectedGenre]);

  useEffect(() => {
    let cancelled = false;

    const carregarGeneres = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/genres`);
        if (!res.ok) {
          throw new Error('failed to fetch genres');
        }

        const body = await res.json();
        if (!cancelled) {
          setGenres(body.genres || []);
        }
      } catch (err) {
        console.error('load genres error', err);
      }
    };

    carregarGeneres();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setAnimes([]);
    setHasMore(true);
    carregarAnimes(0, selectedGenre, minRating, maxRating);
  }, [carregarAnimes, maxRating, minRating, selectedGenre]);

  const referenciaUltimAnime = useCallback((node) => {
    if (loading || loadingMore) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        carregarAnimes(animes.length, selectedGenre, minRating, maxRating);
      }
    }, { rootMargin: '300px' });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [animes.length, hasMore, carregarAnimes, loading, loadingMore, maxRating, minRating, selectedGenre]);

  const canviarPuntuacioMinima = (event) => {
    const nextMin = Number(event.target.value);
    setMinRating(Math.min(nextMin, maxRating));
  };

  const canviarPuntuacioMaxima = (event) => {
    const nextMax = Number(event.target.value);
    setMaxRating(Math.max(nextMax, minRating));
  };

  const renderitzarControlsFiltre = (idPrefix = 'directory') =>
  <>
      <div className="directory-filter-field">
        <label className="directory-filter-label" htmlFor={`${idPrefix}-genre-select`}>
          Género
        </label>
        <select
        id={`${idPrefix}-genre-select`}
        className="directory-filter-select"
        value={selectedGenre}
        onChange={(event) => setSelectedGenre(event.target.value)}>
        
          <option value="">Todos</option>
          {genres.map((genre) =>
        <option key={genre.id_genere} value={genre.id_genere}>
              {genre.nom}
            </option>
        )}
        </select>
      </div>

      <div className="directory-filter-field">
        <label className="directory-filter-label" htmlFor={`${idPrefix}-min-rating`}>
          Valoración
        </label>
        <div className="directory-rating-filter">
          <span className="directory-rating-filter-value">
            {minRating} - {maxRating} estrellas
          </span>
          <div
          className="directory-rating-slider"
          style={{ '--rating-min': minRating, '--rating-max': maxRating }}>
          
            <input
            id={`${idPrefix}-min-rating`}
            type="range"
            min={MIN_STARS}
            max={MAX_STARS}
            step="1"
            value={minRating}
            onChange={canviarPuntuacioMinima}
            aria-label="Valoración minima" />
          
            <input
            id={`${idPrefix}-max-rating`}
            type="range"
            min={MIN_STARS}
            max={MAX_STARS}
            step="1"
            value={maxRating}
            onChange={canviarPuntuacioMaxima}
            aria-label="Valoración maxima" />
          
          </div>
          <div className="directory-rating-scale" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((value) =>
          <span key={value}>{value}</span>
          )}
          </div>
        </div>
      </div>
    </>;


  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <BarraNavegacio directory={false} />
      <div className="directory-content">
        <br />
        <h1>DIRECTORIO DE ANIMES</h1>

        <div className="directory-filters directory-filters-desktop">
          {renderitzarControlsFiltre('directory')}
        </div>

        <div className="directory-filters-mobile">
          <button
            type="button"
            className="directory-filter-toggle"
            onClick={() => setMobileFiltersOpen((current) => !current)}
            aria-expanded={mobileFiltersOpen}
            aria-controls="directory-mobile-filters">
            
            <FiFilter size={18} />
            <span>Filtros</span>
          </button>

          {mobileFiltersOpen &&
          <div
            id="directory-mobile-filters"
            className="directory-filters directory-filters-panel">
            
              {renderitzarControlsFiltre('directory-mobile')}
            </div>
          }
        </div>

        {loading ?
        <div className="loading-container">
            <div className="loader"></div>
          </div> :

        <>
            {animes.length === 0 ?
          <p className="directory-empty">No hay animes con los filtros seleccionados.</p> :

          <div className="directory-anime-grid">
                {animes.map((anime, index) =>
            <div
              key={obtenirIdAnime(anime) || `${anime.titol || anime.title || 'anime'}-${index}`}
              ref={index === animes.length - 1 ? referenciaUltimAnime : null}>
              
                    <CobertaAnime
                imageUrl={anime.imatge_portada || anime.imageUrl || ''}
                title={anime.titol || anime.title || '---'}
                synopsis={anime.sinopsi_es || anime.sinopsi || ''}
                episodeCount={anime.episodeCount}
                showStar={false}
                onClick={() => seleccionarAnime(anime)} />
              
                  </div>
            )}
              </div>
          }

            {loadingMore &&
          <div className="loading-container directory-loading-more">
                <div className="loader"></div>
              </div>
          }

            {error && <p className="directory-error">{error}</p>}
          </>
        }
      </div>
      <PeuPagina />
    </div>);

}export { Directori as default };
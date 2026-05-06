import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/NavBar/NavBar.jsx';
import { AnimeCover } from '../components/AnimeCover/AnimeCover.jsx';
import Footer from '../components/Footer/Footer.jsx';
import '../styles/directory.css';

const PAGE_SIZE = 16;

export default function Directory() {
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const [animes, setAnimes] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  function handleSelect(anime) {
    const id = anime.id_anime || anime.id;
    if (id) {
      navigate(`/details/${id}`);
    }
  }

  const loadAnimes = useCallback(async (offset = 0, genre = selectedGenre) => {
    const isFirstPage = offset === 0;

    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      setError('');
      const genreQuery = genre ? `&genre=${encodeURIComponent(genre)}` : '';
      const res = await fetch(
        `${import.meta.env.VITE_BACKENDURL}/api/anime?limit=${PAGE_SIZE}&offset=${offset}${genreQuery}`
      );

      if (!res.ok) {
        throw new Error('failed to fetch');
      }

      const body = await res.json();
      const list = body.anime || [];

      setAnimes((current) => (isFirstPage ? list : [...current, ...list]));
      setHasMore(Boolean(body.hasMore));
    } catch (err) {
      console.error('load animes error', err);
      setError('No se pudieron cargar los animes.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    let cancelled = false;

    const loadGenres = async () => {
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

    loadGenres();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setAnimes([]);
    setHasMore(true);
    loadAnimes(0, selectedGenre);
  }, [loadAnimes, selectedGenre]);

  const lastAnimeRef = useCallback((node) => {
    if (loading || loadingMore) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadAnimes(animes.length, selectedGenre);
      }
    }, { rootMargin: '300px' });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [animes.length, hasMore, loadAnimes, loading, loadingMore, selectedGenre]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Navbar directory={false} />
      <div className="directory-content">
        <br />
        <h1>DIRECTORIO DE ANIMES</h1>

        <div className="directory-filters">
          <label className="directory-filter-label" htmlFor="directory-genre-select">
            Género
          </label>
          <select
            id="directory-genre-select"
            className="directory-filter-select"
            value={selectedGenre}
            onChange={(event) => setSelectedGenre(event.target.value)}
          >
            <option value="">Todos</option>
            {genres.map((genre) => (
              <option key={genre.id_genere} value={genre.id_genere}>
                {genre.nom}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        ) : (
          <>
            <div className="directory-anime-grid">
              {animes.map((anime, index) => (
                <div
                  key={anime.id_anime || anime.id}
                  ref={index === animes.length - 1 ? lastAnimeRef : null}
                >
                  <AnimeCover
                    imageUrl={anime.imatge_portada || anime.imageUrl || ''}
                    title={anime.titol || anime.title || '---'}
                    synopsis={anime.sinopsi_es || anime.sinopsi || ''}
                    episodeCount={anime.episodeCount}
                    showStar={false}
                    onClick={() => handleSelect(anime)}
                  />
                </div>
              ))}
            </div>

            {loadingMore && (
              <div className="loading-container directory-loading-more">
                <div className="loader"></div>
              </div>
            )}

            {error && <p className="directory-error">{error}</p>}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

import { Navbar } from '../components/NavBar/NavBar.jsx'
import { AnimeCover } from '../components/AnimeCover/AnimeCover.jsx'
import Footer from '../components/Footer/Footer.jsx'
import '../styles/directory.css'
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 16;

export default function Directory() {
  const navigate = useNavigate();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const observerRef = useRef(null);

  function handleSelect(anime) {
    const id = anime.id_anime || anime.id;
    if (id) {
      navigate(`/details/${id}`);
    }
  }

  const loadAnimes = useCallback(async (offset = 0) => {
    const isFirstPage = offset === 0;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      setError('');
      const res = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime?limit=${PAGE_SIZE}&offset=${offset}`);
      if (!res.ok) throw new Error('failed to fetch');
      const body = await res.json();
      const list = body.anime || [];

      setAnimes((current) => isFirstPage ? list : [...current, ...list]);
      setHasMore(Boolean(body.hasMore));
    } catch (err) {
      console.error('load animes error', err);
      setError('No se pudieron cargar los animes.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadAnimes(0);
  }, [loadAnimes]);

  const lastAnimeRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadAnimes(animes.length);
      }
    }, { rootMargin: '300px' });

    if (node) observerRef.current.observe(node);
  }, [animes.length, hasMore, loadAnimes, loading, loadingMore]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Navbar directory={false} />
      <div className="content directory-content">
        <br />
        <h1>DIRECTORIO DE ANIMES</h1>
        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        ) : (
          <>
            <div className="directory-anime-grid">
              {animes.map((a, index) => (
                <div
                  key={a.id_anime || a.id}
                  ref={index === animes.length - 1 ? lastAnimeRef : null}
                >
                  <AnimeCover
                    imageUrl={a.imatge_portada || a.imageUrl || ''}
                    title={a.titol || a.title || '---'}
                    synopsis={a.sinopsi_es || a.sinopsi || ''}
                    episodeCount={a.episodeCount}
                    showStar={false}
                    onClick={() => handleSelect(a)}
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

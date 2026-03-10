import { Navbar } from '../components/NavBar/NavBar.jsx'
import { AnimeCover } from '../components/AnimeCover/AnimeCover.jsx'
import '../styles/directory.css'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Directory() {
  const navigate = useNavigate();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);

  function handleSelect(anime) {
    const id = anime.id_anime || anime.id;
    if (id) {
      navigate(`/details/${id}`);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/anime');
        if (!res.ok) throw new Error('failed to fetch');
        const body = await res.json();
        if (!cancelled) {
          const list = body.anime || [];
          console.log('fetched animes', list.map(a=>({id:a.id_anime,episodeCount:a.episodeCount}))); // debug
          setAnimes(list);
        }
      } catch (err) {
        console.error('load animes error', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <Navbar directory={false} />
      <div className="content">
        <br />
        <h1>DIRECTORIO DE ANIMES</h1>
        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="anime-grid">
            {animes.map((a) => (
              <AnimeCover
                key={a.id_anime || a.id}
                imageUrl={a.imatge_portada || a.imageUrl || ''}
                title={a.titol || a.title || '---'}
                synopsis={a.sinopsi_es || a.sinopsi || ''}
                episodeCount={a.episodeCount}
                showStar={false} /* cambiar según sesión */
                onClick={() => handleSelect(a)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
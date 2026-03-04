import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/NavBar/NavBar.jsx';
import { AnimeDetails } from '../components/AnimeDetails/AnimeDetails.jsx';

export default function Details() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/anime/${id}`);
        const data = await r.json();
        if (data && data.anime) {
          setAnime(data.anime);
        } else {
          setError(data.error || 'Anime no encontrado');
        }
      } catch (err) {
        console.error('fetch anime error', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return (
    <div>
      <Navbar />
      {loading && (
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      )}
      {!loading && error && <p className="error-message">{error}</p>}
      {!loading && anime && <AnimeDetails anime={anime} />}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAutenticacio } from '../hooks/useAuth';
import { BarraNavegacio } from '../components/NavBar/NavBar.jsx';
import { DetallsAnime } from '../components/AnimeDetails/AnimeDetails.jsx';
import PeuPagina from '../components/Footer/Footer.jsx';

function Detalls() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });
  const [userRating, setUserRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(true);
  const [ratingError, setRatingError] = useState('');
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState('');
  const [episodeCount, setEpisodeCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isLoggedIn, user } = useAutenticacio();
  const currentUserId = user?.id_usuari || user?.id_usuario || user?.id_user || user?.id || null;
  const currentUserIsAdmin = user?.isAdmin === true;

  useEffect(() => {
    if (!id) return;

    const carregarDades = async () => {
      setLoading(true);
      setError('');
      try {
        const r = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/${id}`);
        const data = await r.json();
        if (data && data.anime) {
          setAnime(data.anime);
        } else {
          setError(data.error || 'Anime no encontrado');
        }
      } catch (err) {
        console.error('fetch anime error', err);
        setError('Error al cargar los datos del anime');
      } finally {
        setLoading(false);
      }
    };

    carregarDades();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const carregarComentaris = async () => {
      setCommentsLoading(true);
      try {
        const r = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/${id}/comments`);
        const data = await r.json();
        if (data && data.success) {
          setComments(data.comments || []);
        } else {
          console.error('fetch comments error', data.error);
          setComments([]);
        }
      } catch (err) {
        console.error('fetch comments error', err);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    carregarComentaris();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const carregarValoracio = async () => {
      setRatingLoading(true);
      setRatingError('');
      try {
        const r = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/${id}/rating`, { credentials: 'include' });
        const data = await r.json();
        if (data && data.success) {
          setRatingData(data.rating || { average: 0, count: 0 });
          setUserRating(data.userRating ?? null);
        } else {
          setRatingError(data.error || 'Error al cargar valoración');
        }
      } catch (err) {
        console.error('fetch rating error', err);
        setRatingError('Error al cargar valoración');
      } finally {
        setRatingLoading(false);
      }
    };

    carregarValoracio();
  }, [id, isLoggedIn]);

  useEffect(() => {
    if (!id) return;

    const carregarProgres = async () => {
      setProgressLoading(true);
      setProgressError('');
      try {
        const r = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/${id}/progress`, { credentials: 'include' });
        const data = await r.json();
        if (data && data.success) {
          setProgress(data.progress || null);
          setEpisodeCount(data.episodeCount || 0);
        } else {
          setProgressError(data.error || 'Error al cargar el progreso');
        }
      } catch (err) {
        console.error('fetch progress error', err);
        setProgressError('Error al cargar el progreso');
      } finally {
        setProgressLoading(false);
      }
    };

    carregarProgres();
  }, [id, isLoggedIn]);

  // Cargar si el anime está en favoritos
  useEffect(() => {
    if (!id || !isLoggedIn) {
      setIsFavorite(false);
      return;
    }

    const comprovarFavorit = async () => {
      try {
        const r = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/favorites`, { credentials: 'include' });
        const data = await r.json();
        if (data && data.success && data.favorites) {
          const isFav = data.favorites.some((fav) => String(fav.id_anime) === String(id));
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.error('fetch favorite status error', err);
      }
    };

    comprovarFavorit();
  }, [id, isLoggedIn]);

  const afegirAFavorits = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/favorites/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error('add to favorites error', data.error);
        return;
      }
      setIsFavorite(true);
    } catch (err) {
      console.error('add to favorites error', err);
    }
  };

  const eliminarDeFavorits = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/favorites/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error('remove from favorites error', data.error);
        return;
      }
      setIsFavorite(false);
    } catch (err) {
      console.error('remove from favorites error', err);
    }
  };

  const valorarAnime = async (value) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/${id}/rating`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ puntuacio: value })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error('submit rating error', data.error);
        return;
      }
      setRatingData(data.rating || { average: 0, count: 0 });
      setUserRating(data.userRating ?? value);
    } catch (err) {
      console.error('submit rating error', err);
    }
  };

  const actualitzarProgres = async (value) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/${id}/progress`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ capitols_vistos: value })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error('submit progress error', data.error);
        setProgressError(data.error || 'Error al guardar el progreso');
        return;
      }
      setProgress(data.progress || { capitols_vistos: value });
      setProgressError('');
    } catch (err) {
      console.error('submit progress error', err);
      setProgressError('Error al guardar el progreso');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <BarraNavegacio />
      {loading &&
      <div className="loading-container">
          <div className="loader"></div>
        </div>
      }
      {!loading && error && <p className="error-message">{error}</p>}
      {!loading && anime &&
      <DetallsAnime
        anime={anime}
        animeId={anime.id_anime}
        comments={comments}
        commentsLoading={commentsLoading}
        isLoggedIn={isLoggedIn}
        rating={ratingData}
        userRating={userRating}
        ratingLoading={ratingLoading}
        ratingError={ratingError}
        onRate={valorarAnime}
        progress={progress}
        progressLoading={progressLoading}
        progressError={progressError}
        episodeCount={episodeCount}
        onProgressChange={actualitzarProgres}
        onCommentAdded={(newComment) => setComments((prevComments) => [newComment, ...prevComments])}
        onCommentDeleted={(commentId) => setComments((prevComments) => prevComments.filter((comment) => String(comment.id_comentari) !== String(commentId)))}
        currentUserId={currentUserId}
        currentUserIsAdmin={currentUserIsAdmin}
        isFavorite={isFavorite}
        onAddToFavorites={afegirAFavorits}
        onRemoveFromFavorites={eliminarDeFavorits} />

      }
      <PeuPagina />
    </div>);

}export { Detalls as default };
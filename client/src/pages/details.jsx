import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/NavBar/NavBar.jsx';
import { AnimeDetails } from '../components/AnimeDetails/AnimeDetails.jsx';
import Footer from '../components/Footer/Footer.jsx';

export default function Details() {
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
  const { isLoggedIn, user } = useAuth();
  const currentUserId = user?.id_usuari || user?.id_usuario || user?.id_user || user?.id || null;

  useEffect(() => {
    if (!id) return;

    const load = async () => {
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

    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const loadComments = async () => {
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

    loadComments();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const loadRating = async () => {
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

    loadRating();
  }, [id, isLoggedIn]);

  useEffect(() => {
    if (!id) return;

    const loadProgress = async () => {
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

    loadProgress();
  }, [id, isLoggedIn]);

  // Cargar si el anime está en favoritos
  useEffect(() => {
    if (!id || !isLoggedIn) {
      setIsFavorite(false);
      return;
    }

    const checkFavorite = async () => {
      try {
        const r = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/favorites`, { credentials: 'include' });
        const data = await r.json();
        if (data && data.success && data.favorites) {
          const isFav = data.favorites.some(fav => String(fav.id_anime) === String(id));
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.error('fetch favorite status error', err);
      }
    };

    checkFavorite();
  }, [id, isLoggedIn]);

  const handleAddToFavorites = async () => {
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

  const handleRemoveFromFavorites = async () => {
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

  const handleRate = async (value) => {
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

  const handleProgressChange = async (value) => {
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
      <Navbar />
      {loading && (
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      )}
      {!loading && error && <p className="error-message">{error}</p>}
      {!loading && anime && (
        <AnimeDetails
          anime={anime}
          animeId={anime.id_anime}
          comments={comments}
          commentsLoading={commentsLoading}
          isLoggedIn={isLoggedIn}
          rating={ratingData}
          userRating={userRating}
          ratingLoading={ratingLoading}
          ratingError={ratingError}
          onRate={handleRate}
          progress={progress}
          progressLoading={progressLoading}
          progressError={progressError}
          episodeCount={episodeCount}
          onProgressChange={handleProgressChange}
          onCommentAdded={(newComment) => setComments((prevComments) => [newComment, ...prevComments])}
          onCommentDeleted={(commentId) => setComments((prevComments) => prevComments.filter((comment) => String(comment.id_comentari) !== String(commentId)))}
          currentUserId={currentUserId}
          isFavorite={isFavorite}
          onAddToFavorites={handleAddToFavorites}
          onRemoveFromFavorites={handleRemoveFromFavorites}
        />
      )}
      <Footer />
    </div>
  );
}

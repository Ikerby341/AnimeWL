import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIsLoggedIn } from '../hooks/useAuth';
import { Navbar } from '../components/NavBar/NavBar.jsx';
import { AnimeDetails } from '../components/AnimeDetails/AnimeDetails.jsx';

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
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError('');
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
        const r = await fetch(`/api/anime/${id}/comments`);
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
        const r = await fetch(`/api/anime/${id}/rating`, { credentials: 'include' });
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

  const handleRate = async (value) => {
    try {
      const response = await fetch(`/api/anime/${id}/rating`, {
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

  return (
    <div>
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
          onCommentAdded={(newComment) => setComments((prevComments) => [newComment, ...prevComments])}
        />
      )}
    </div>
  );
}
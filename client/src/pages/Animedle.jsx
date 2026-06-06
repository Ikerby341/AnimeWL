import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BarraNavegacio } from '../components/NavBar/NavBar.jsx';
import PeuPagina from '../components/Footer/Footer.jsx';
import { useAutenticacio } from '../hooks/useAuth.js';
import '../styles/animedle.css';

function JocAnimedle() {
  const { isLoggedIn, loading: authLoading } = useAutenticacio();
  const [game, setGame] = useState(null);
  const [guess, setGuess] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;
    async function loadGame() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/animedle`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'No se pudo cargar Animedle.');
        }

        if (!cancelled) {
          setGame(data.game);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Error al cargar Animedle.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGame();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || game?.finished || guess.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKENDURL}/api/animedle/suggestions?q=${encodeURIComponent(guess)}`,
          { credentials: 'include' }
        );
        const data = await response.json();

        if (!cancelled && response.ok && data.success) {
          setSuggestions(data.suggestions || []);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [game?.finished, guess, isLoggedIn]);

  async function submitGuess(selectedTitle) {
    const trimmedGuess = String(selectedTitle || '').trim();
    if (!trimmedGuess || submitting || game?.finished) return;

    setSubmitting(true);
    setError('');
    setGuess(trimmedGuess);
    setSuggestions([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/animedle/guess`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ guess: trimmedGuess })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo enviar el intento.');
      }

      setGame(data.game);
      setGuess('');
      setSuggestions([]);
    } catch (err) {
      setError(err.message || 'Error al enviar el intento.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const attemptsLeft = game ? Math.max(game.maxAttempts - game.attempts, 0) : 0;
  const imageStyle = game ? { filter: `blur(${game.blur}px)` } : undefined;

  return (
    <div className="animedle-layout">
      <BarraNavegacio />
      <main className="animedle-page">
        <section className="animedle-header">
          <h1>RETO DIARIO</h1>
          <p className="animedle-subtitle">Adivina el anime de hoy mirando su portada desenfocada.</p>
          <p className="animedle-previous">
            El anime del dia anterior era: <span>{game?.previousAnswer || 'todavia no disponible'}</span>
          </p>
        </section>

        {loading ?
        <div className="loading-container">
            <div className="loader"></div>
          </div> :

        <section className="animedle-game">
            <div className="animedle-cover-wrap">
              {game?.imageUrl ?
            <img
              src={game.imageUrl}
              alt="Portada desenfocada del reto"
              className="animedle-cover"
              style={imageStyle} /> :


            <div className="animedle-cover animedle-cover-empty" />
            }
            </div>

            <div className="animedle-panel">
              <div className="animedle-status">
                <span>{game?.attempts || 0}/{game?.maxAttempts || 5} intentos</span>
                <span>{attemptsLeft} restantes</span>
              </div>

              {game?.finished ?
            <div className={`animedle-result ${game.won ? 'animedle-result-win' : 'animedle-result-loss'}`}>
                  {game.won ? 'Has acertado el Animedle de hoy.' : 'Has agotado los intentos de hoy.'}
                  <strong>{game.answer}</strong>
                  <span>Nuevo reto cada dia a las 22:00.</span>
                </div> :

            <div className="animedle-form">
                  <div className="animedle-input-wrap">
                    <input
                  type="text"
                  value={guess}
                  onChange={(event) => setGuess(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                    }
                  }}
                  placeholder="Busca y selecciona un anime..."
                  autoComplete="off"
                  aria-label="Nombre del anime"
                  disabled={submitting} />
                
                    {suggestions.length > 0 &&
                <ul className="animedle-suggestions">
                        {suggestions.map((suggestion) =>
                  <li key={suggestion.id_anime}>
                            <button
                      type="button"
                      disabled={submitting}
                      onClick={() => submitGuess(suggestion.titol)}>
                      
                              {suggestion.titol}
                            </button>
                          </li>
                  )}
                      </ul>
                }
                  </div>
                  {submitting && <p className="animedle-submitting">Comprobando...</p>}
                </div>
            }

              {error && <p className="animedle-error">{error}</p>}

              {game?.guesses?.length > 0 &&
            <div className="animedle-guesses">
                  <h2>Intentos</h2>
                  {game.guesses.map((item, index) =>
              <div
                key={`${item.title}-${index}`}
                className={`animedle-guess ${item.correct ? 'animedle-guess-correct' : 'animedle-guess-wrong'}`}>
                
                      <span>{item.title}</span>
                      <strong>{item.correct ? 'Correcto' : 'Fallado'}</strong>
                    </div>
              )}
                </div>
            }
            </div>
          </section>
        }
      </main>
      <PeuPagina />
    </div>);

}export { JocAnimedle as default };
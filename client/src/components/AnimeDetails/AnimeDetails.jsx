import { useState } from 'react';
import './AnimeDetails.css'
import { AnimeComments } from '../AnimeComments/AnimeComments.jsx';

export function AnimeDetails({ anime, animeId, comments = [], commentsLoading = true, isLoggedIn = false, onCommentAdded, rating = { average: 0, count: 0 }, userRating = null, ratingLoading = false, ratingError = '', onRate, progress = null, progressLoading = true, progressError = '', episodeCount = 0, onProgressChange, isFavorite = false, onAddToFavorites, onRemoveFromFavorites }) {
    const [selectedStars, setSelectedStars] = useState(null);
    const [hoverStars, setHoverStars] = useState(0);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    if (!anime) {
        return <div>No hay información del anime.</div>;
    }
    const { titol, sinopsi, imatge_portada, genres = [], sinopsi_es } = anime;

    const effectiveStars = selectedStars !== null ? selectedStars : (userRating !== null ? userRating : Math.round(rating.average || 0));
    const displayedStars = hoverStars || effectiveStars;
    const hasInteractiveRating = isLoggedIn && typeof onRate === 'function';

    const handleStarClick = (value) => {
        if (!hasInteractiveRating) return;
        setSelectedStars(value);
        onRate(value);
    };

    const handleFavoriteClick = async () => {
        setFavoriteLoading(true);
        try {
            if (isFavorite && onRemoveFromFavorites) {
                await onRemoveFromFavorites();
            } else if (!isFavorite && onAddToFavorites) {
                await onAddToFavorites();
            }
        } finally {
            setFavoriteLoading(false);
        }
    };

    const starElements = [1, 2, 3, 4, 5].map((value) => {
        const isActive = value <= displayedStars;
        return (
            <button
                key={value}
                type="button"
                className={`star ${isActive ? 'selected' : ''} ${hasInteractiveRating ? 'clickable' : ''}`}
                onMouseEnter={() => hasInteractiveRating && setHoverStars(value)}
                onMouseLeave={() => hasInteractiveRating && setHoverStars(0)}
                onClick={() => handleStarClick(value)}
                aria-label={`${value} estrella${value > 1 ? 's' : ''}`}
            >
                ★
            </button>
        );
    });

    // formato de géneros: primera letra en mayúscula, guiones convertidos en espacios
    const formattedGenres = genres
        .map((g) => g.replace(/-/g, ' '))
        .map((g) => g.replace(/_/g, ' '))
        .map((g) => g.charAt(0).toUpperCase() + g.slice(1));

    // sinopsis con saltos de línea conservados usando <br />
    const synopsisText = (sinopsi_es || sinopsi) || '';
    const synopsisLines = synopsisText.split('\n').map((line, idx) => (
        <span key={idx}>
            {line}
            {idx < synopsisText.split('\n').length - 1 && <br />}
        </span>
    ));

    return (
        <div className="anime-details">
            <div className="anime-main">
                <div className="anime-column1">
                    <div className="anime-poster-container">
                        <img
                            id="anime-img"
                            src={imatge_portada || ''}
                            alt={titol}
                            className="anime-poster"
                        />
                        {isLoggedIn && (
                            <button
                                className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
                                onClick={handleFavoriteClick}
                                disabled={favoriteLoading}
                                title={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
                            >
                                {favoriteLoading ? (
                                    '...'
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                        <path d="M8 4h8c1.1 0 2 .9 2 2v14l-6-4-6 4V6c0-1.1.9-2 2-2z" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                    {isLoggedIn && (
                        <div className="anime-progress">
                            <label htmlFor="progress-select">Has visto hasta el capítulo:</label>
                            {progressLoading ? (
                                <p className="progress-loading">Cargando progreso...</p>
                            ) : (
                                <>
                                    {episodeCount > 0 ? (
                                        <select
                                            id="progress-select"
                                            className="progress-select"
                                            value={progress?.capitols_vistos ?? 0}
                                            onChange={(e) => onProgressChange(Number(e.target.value))}
                                        >
                                            <option value={0}>0 (No visto)</option>
                                            {Array.from({ length: episodeCount }, (_, index) => (
                                                <option key={index + 1} value={index + 1}>
                                                    {index + 1}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="progress-no-data">No hay datos de capítulos disponibles.</p>
                                    )}
                                    {progressError && <div className="progress-error">{progressError}</div>}
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="anime-column2">
                    <div className="anime-details-header">
                        <div>
                            <h1 id="anime-title">{titol}</h1>
                            <p id="gender">Géneros: {formattedGenres.join(', ')}</p>
                        </div>
                        <div className="anime-rating">
                            <div className="anime-rating-stars">{starElements}</div>
                            <div className="anime-rating-summary">
                                {ratingLoading
                                    ? 'Cargando valoración...'
                                    : `Valoración media ${rating.average.toFixed(1)} / 5 (${rating.count} valoraciones)`}
                            </div>
                            {ratingError && <div className="anime-rating-error">{ratingError}</div>}
                        </div>
                    </div>
                    <p id="synopsis">
                        Sinopsis: {synopsisLines}
                    </p>
                </div>
            </div>
            <AnimeComments
                animeId={animeId}
                comments={comments}
                loading={commentsLoading}
                isLoggedIn={isLoggedIn}
                onCommentAdded={onCommentAdded}
            />
        </div>
    );
}
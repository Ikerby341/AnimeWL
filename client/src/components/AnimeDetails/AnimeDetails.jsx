import { useState } from 'react';
import './AnimeDetails.css'
import { AnimeComments } from '../AnimeComments/AnimeComments.jsx';

export function AnimeDetails({ anime, animeId, comments = [], commentsLoading = true, isLoggedIn = false, onCommentAdded, rating = { average: 0, count: 0 }, userRating = null, ratingLoading = false, ratingError = '', onRate }) {
    const [selectedStars, setSelectedStars] = useState(null);
    const [hoverStars, setHoverStars] = useState(0);

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
                    <img
                        id="anime-img"
                        src={imatge_portada || ''}
                        alt={titol}
                        className="anime-poster"
                    />
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
import './AnimeCoverInLine.css';
import { useState } from 'react';

export function AnimeCoverInLine({
    imageUrl,
    title = '',
    altText = '',
    synopsis = '',
    episodeCount = null,
    showStar = false,
    initialFavorited = false,
    onClick,
}) {
    const [favorited, setFavorited] = useState(initialFavorited);
    const imageAlt = altText || title || 'Anime cover';

    function toggleStar(e) {
        e.stopPropagation();
        setFavorited((f) => !f);
    }

    function handleKeyDown(event) {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
        }
    }

    return (
        <div
            className="anime-cover"
            onClick={onClick}
            onKeyDown={handleKeyDown}
            tabIndex={onClick ? 0 : undefined}
            role={onClick ? 'button' : undefined}
            aria-label={onClick ? `Abrir anime ${imageAlt}` : undefined}
            style={onClick ? { cursor: 'pointer' } : undefined}
        >
            {/* overlay con info cuando se hace hover */}
            <div className="anime-cover-overlay">
                <div className="overlay-content">
                    {title && <h3 className="overlay-title">{title}</h3>}
                    {/* mostrar el número sólo si es mayor que 0 */}
                    {typeof episodeCount === 'number' && episodeCount > 0 && (
                        <p className="overlay-episodes">{episodeCount} {episodeCount === 1 ? 'capítulo' : 'capítulos'}</p>
                    )}
                    {synopsis && <p className="overlay-synopsis">{synopsis}</p>}
                    {showStar && (
                        <button
                            className={favorited ? 'star selected' : 'star'}
                            onClick={toggleStar}
                            aria-label={favorited ? 'Quitar favorito' : 'Marcar favorito'}
                        >
                            ★
                        </button>
                    )}
                </div>
            </div>
            <img src={imageUrl} alt={imageAlt} className="anime-cover-image" />
            {title && <div className="anime-cover-title">{title}</div>}
        </div>
    );
}


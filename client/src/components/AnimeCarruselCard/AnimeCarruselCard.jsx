import './AnimeCarruselCard.css';

export function AnimeCarruselCard({
    imageUrl,
    title = '',
    subtitle = '',
    altText = 'Anime Cover',
    synopsis = '',
    episodeCount = null,
    showTitle = false,
    onClick,
}) {

    return (
        <div className="anime-carrusel-cover" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
            {/* overlay con info cuando se hace hover */}
            <div className="anime-carrusel-overlay">
                <div className="carrusel-overlay-content">
                    {title && <h3 className="carrusel-overlay-title">{title}</h3>}
                    {/* mostrar el número sólo si es mayor que 0 */}
                    {typeof episodeCount === 'number' && episodeCount > 0 && (
                        <p className="carrusel-overlay-episodes">{episodeCount} capítulos</p>
                    )}
                    {synopsis && <p className="carrusel-overlay-synopsis">{synopsis}</p>}
                </div>
            </div>
            <img src={imageUrl} alt={altText} className="anime-carrusel-image" />
            {/* bottom bar always visible with title + optional subtitle */}
            {showTitle && (
                <div className="carrusel-bottom-bar">
                    {title && <h4 className="bottom-title">{title}</h4>}
                    {subtitle && <p className="bottom-subtitle">{subtitle}</p>}
                </div>
            )}
        </div>
    );
}
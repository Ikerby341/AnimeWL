import './AnimeCover.css';

export function AnimeCover({ imageUrl, title = '', altText = 'Anime Cover', onClick }) {
    return (
        <div className="anime-cover" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
            {/* overlay para hover con icono de play */}
            <div className="anime-cover-overlay">
                <svg viewBox="0 0 64 64" aria-hidden="true">
                    <polygon points="24,16 24,48 48,32" />
                </svg>
            </div>
            <img src={imageUrl} alt={altText} className="anime-cover-image" />
            {title && <div className="anime-cover-title">{title}</div>}
        </div>
    );
}
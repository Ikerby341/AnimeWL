import './AnimeDetails.css'
import { AnimeComments } from '../AnimeComments/AnimeComments.jsx';

export function AnimeDetails({ anime, comments = [], commentsLoading = true }) {
    if (!anime) {
        return <div>No hay información del anime.</div>;
    }
    const { titol, sinopsi, imatge_portada, genres = [], sinopsi_es } = anime;

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
                    <h1 id="anime-title">{titol}</h1>
                    <p id="gender">Géneros: {formattedGenres.join(', ')}</p>
                    <p id="synopsis">
                        Sinopsis: {synopsisLines}
                    </p>
                </div>
            </div>
            <AnimeComments comments={comments} loading={commentsLoading} />
        </div>
    );
}
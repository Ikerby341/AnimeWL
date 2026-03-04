import './AnimeDetails.css'


export function AnimeDetails({ anime }) {
    if (!anime) {
        return <div>No hay información del anime.</div>;
    }
    const { titol, sinopsi, imatge_portada, genres = [], sinopsi_es } = anime;

    return (
        <div className="anime-details">
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
                <p id="gender">Géneros: {genres.join(', ')}</p>
                <p id="synopsis">
                    Sinopsis: {sinopsi_es || sinopsi}
                </p>
            </div>
        </div>
    );
}
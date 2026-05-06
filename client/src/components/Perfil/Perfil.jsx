import { useUserInfo, useAuth } from './../../hooks/useAuth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userIcon from './../../assets/usuari.webp';
import './Perfil.css';
import { useToast } from '../../hooks/useToast.js';

const addAnimePlaceholder = 'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22%3E%3Crect width=%22120%22 height=%22120%22 rx=%2224%22 fill=%22%23111%22/%3E%3Cpath d=%22M60 34a6 6 0 0 1 6 6v14h14a6 6 0 0 1 0 12H66v14a6 6 0 1 1-12 0V66H40a6 6 0 0 1 0-12h14V40a6 6 0 0 1 6-6z%22 fill=%22%23fff%22/%3E%3C/svg%3E';



export function Perfil({ profileUser = null, profileFavorites = [], readOnly = false, hideEmail = false }) {
    const navigate = useNavigate();
    const ownUserInfo = useUserInfo();
    let userInfo = profileUser || ownUserInfo;
    const { checkSession } = useAuth();
    const { showToast } = useToast();
    const [favoriteAnime, setFavoriteAnime] = useState(null);
    const [recommendedAnime, setRecommendedAnime] = useState(null);
    const [watchingAnime, setWatchingAnime] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchType, setSearchType] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchError, setSearchError] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchAnime = async (id, setter, label) => {
            if (!id) {
                setter(null);
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/${id}?cacheOnly=true`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    console.error(`Error fetching ${label} anime:`, response.status);
                    setter(null);
                    return;
                }

                const data = await response.json();
                setter(data?.anime ?? data);
            } catch (error) {
                console.error(`Error fetching ${label} anime:`, error);
                setter(null);
            }
        };

        fetchAnime(userInfo?.id_anime_preferit, setFavoriteAnime, 'favorite');
        fetchAnime(userInfo?.id_anime_recomanat, setRecommendedAnime, 'recommended');
    }, [userInfo?.id_anime_preferit, userInfo?.id_anime_recomanat]);

    // Obtener un anime aleatorio de la lista de favoritos que esté "Viendo"
    useEffect(() => {
        if (profileFavorites && profileFavorites.length > 0) {
            // Si ya tenemos los favoritos (desde ProfilePage), usarlos directamente
            const watchingList = profileFavorites.filter(fav => fav.estat === 'Viendo');
            if (watchingList.length === 0) {
                setWatchingAnime(null);
                return;
            }

            const randomIndex = Math.floor(Math.random() * watchingList.length);
            setWatchingAnime(watchingList[randomIndex].anime);
            return;
        }

        if (readOnly) {
            // Si es perfil público y profileFavorites está vacío
            setWatchingAnime(null);
            return;
        }

        const fetchWatchingAnime = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/favorites`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    console.error('Error fetching favorites:', response.status);
                    setWatchingAnime(null);
                    return;
                }

                const data = await response.json();
                if (!data.success || !data.favorites) {
                    setWatchingAnime(null);
                    return;
                }

                // Filtrar solo los que están en estado "Viendo"
                const watchingList = data.favorites.filter(fav => fav.estat === 'Viendo');

                if (watchingList.length === 0) {
                    setWatchingAnime(null);
                    return;
                }

                // Seleccionar uno aleatorio
                const randomIndex = Math.floor(Math.random() * watchingList.length);
                setWatchingAnime(watchingList[randomIndex].anime);
            } catch (error) {
                console.error('Error fetching watching anime:', error);
                setWatchingAnime(null);
            }
        };

        fetchWatchingAnime();
    }, [readOnly, profileFavorites]);

    useEffect(() => {
        if (!showSearchModal || searchQuery.trim() === '') {
            setSearchResults([]);
            setSearchError(null);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            setSearchError(null);
            setIsSearching(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/jikan/search?q=${encodeURIComponent(searchQuery)}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Error al buscar anime');
                }
                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error || 'Error al buscar anime');
                }
                setSearchResults(data.data || []);
            } catch (error) {
                console.error('Error searching anime:', error);
                setSearchError('No se pudieron cargar los resultados de búsqueda.');
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, showSearchModal]);

    function openSearchModal(type) {
        if (readOnly) return;
        setSearchType(type);
        setSearchQuery('');
        setSearchResults([]);
        setSearchError(null);
        setShowSearchModal(true);
    }

    function closeSearchModal() {
        setShowSearchModal(false);
        setSearchType(null);
        setSearchQuery('');
        setSearchResults([]);
        setSearchError(null);
    }

    function normalizeAnimeResult(anime) {
        const title = anime.title || anime.titol || anime.name || 'Anime desconocido';
        const imageUrl = anime.images?.jpg?.image_url || anime.imatge_portada || anime.image_url || '';
        const id = anime.mal_id || anime.id_anime || anime.id || null;
        const type = anime.type || anime.estat || 'Anime';
        const rawYear = anime.year || anime.aired?.from || anime.dataafegit || anime.lastupdate || anime.created_at;
        const year = rawYear
            ? String(rawYear).slice(0, 4)
            : 'Año desconocido';
        return { title, imageUrl, id, type, year };
    }

    function getAnimeId(anime) {
        return anime?.id_anime || anime?.id || anime?.mal_id || null;
    }

    function handleProfileAnimeClick(anime, editableType) {
        if (readOnly) {
            const animeId = getAnimeId(anime);
            if (animeId) {
                navigate(`/details/${animeId}`);
            }
            return;
        }

        openSearchModal(editableType);
    }

    function handleProfileAnimeKeyDown(event, anime, editableType) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleProfileAnimeClick(anime, editableType);
        }
    }

    async function handleSelectSearchResult(anime) {
        if (!searchType) return;
        const normalized = normalizeAnimeResult(anime);
        if (!normalized.id) {
            showToast('No se pudo seleccionar este anime porque falta el identificador.', { type: 'error' });
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/anime`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: searchType,
                    id_anime: normalized.id
                })
            });
            const data = await response.json();
            if (!data.success) {
                showToast('Error al actualizar el anime: ' + (data.error || 'Error desconocido'), { type: 'error' });
                return;
            }
            showToast('Anime actualizado correctamente.', { type: 'success' });
            await checkSession();
            closeSearchModal();
        } catch (error) {
            console.error('Error updating favorite/recommended anime:', error);
            showToast('No se pudo actualizar el anime. Inténtalo de nuevo.', { type: 'error' });
        }
    }

    function editPfpView() {
        if (readOnly) return;
        document.querySelector('.edit-pfp-container').style.display = 'flex';
    };

    function canviarPfp() {
        const newImgUrl = document.querySelector('.edit-pfp-input').value.trim();
        if (!newImgUrl) {
            showToast('La URL no puede estar vacía.', { type: 'error' });
            return;
        }
        fetch(`${import.meta.env.VITE_BACKENDURL}/api/update-profile-picture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ img_url: newImgUrl })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelector('.edit-pfp-container').style.display = 'none';
                    actualitzarUserInfo();
                    showToast('Foto de perfil actualizada correctamente.', { type: 'success' });
                    window.setTimeout(() => window.location.reload(), 900);
                } else {
                    showToast('Error al actualizar la foto de perfil: ' + (data.error || 'Error desconocido'), { type: 'error' });
                }
            })
            .catch(error => {
                console.error('Error al actualizar la foto de perfil:', error);
                showToast('Error al actualizar la foto de perfil: ' + error.message, { type: 'error' });
            })
    }

    function actualitzarUserInfo() {
        fetch(`${import.meta.env.VITE_BACKENDURL}/api/check-session`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    userInfo = data.user;
                } else {
                    userInfo = null;
                }
            })
            .catch(error => {
                console.error('Error checking session:', error);
                userInfo = null;
            });
    }
    return (
        <div className={readOnly ? 'perfil-read-only' : undefined}>
            {!readOnly && <div className='edit-pfp-container'>
                <div className='edit-pfp-overlay'>
                    <span className='edit-pfp-text'>Introduce la URL de la foto de perfil</span>
                    <input type="text" className='edit-pfp-input' placeholder='URL de la foto de perfil' />
                    <button className='edit-pfp-button' onClick={canviarPfp}>Guardar</button>
                    <button className='edit-pfp-button-goback' onClick={() => {
                        document.querySelector('.edit-pfp-container').style.display = 'none';
                    }}>Cancelar</button>
                </div>
            </div>}
            <div className="profile-info">
                <img src={userInfo?.img_url || userIcon} alt="Profile" className="profile-picture" onClick={editPfpView} />
                <div className="profile-details">
                    <h2>{userInfo?.nom || 'Error al cargar el nombre de usuario'}</h2>
                    {!hideEmail && <p>{userInfo?.email || 'Error al cargar el email'}</p>}
                </div>
            </div>
            <div className="profile-separator" />
            <div className="profile-anime-list">
                <div
                    className={readOnly ? (favoriteAnime ? 'anime-card profile-anime-link-card' : 'anime-card') : 'anime-card anime-card-clickable'}
                    onClick={() => handleProfileAnimeClick(favoriteAnime, 'favorite')}
                    onKeyDown={(event) => handleProfileAnimeKeyDown(event, favoriteAnime, 'favorite')}
                    tabIndex={0}
                    role="button"
                    aria-label={favoriteAnime ? `Abrir anime ${favoriteAnime.titol}` : 'Seleccionar anime favorito'}
                >
                    <img
                        src={
                            favoriteAnime?.imatge_portada || addAnimePlaceholder
                        }
                        alt={favoriteAnime?.titol || 'Añadir anime favorito'}
                    />
                    {readOnly && favoriteAnime && (
                        <div className="profile-anime-card-overlay">
                            <span>{favoriteAnime.titol || 'Ver detalles'}</span>
                        </div>
                    )}
                    <p>Anime favorito</p>
                </div>
                <div
                    className={readOnly ? (recommendedAnime ? 'anime-card profile-anime-link-card' : 'anime-card') : 'anime-card anime-card-clickable'}
                    onClick={() => handleProfileAnimeClick(recommendedAnime, 'recommended')}
                    onKeyDown={(event) => handleProfileAnimeKeyDown(event, recommendedAnime, 'recommended')}
                    tabIndex={0}
                    role="button"
                    aria-label={recommendedAnime ? `Abrir anime ${recommendedAnime.titol}` : 'Seleccionar anime recomendado'}
                >
                    <img
                        src={
                            recommendedAnime?.imatge_portada || addAnimePlaceholder
                        }
                        alt={recommendedAnime?.titol || 'Añadir anime recomendado'}
                    />
                    {readOnly && recommendedAnime && (
                        <div className="profile-anime-card-overlay">
                            <span>{recommendedAnime.titol || 'Ver detalles'}</span>
                        </div>
                    )}
                    <p>Anime recomendado</p>
                </div>
                {watchingAnime && (
                    <div
                        className={readOnly ? 'anime-card profile-anime-link-card' : 'anime-card'}
                        onClick={() => readOnly && handleProfileAnimeClick(watchingAnime)}
                        onKeyDown={(event) => readOnly && handleProfileAnimeKeyDown(event, watchingAnime)}
                        tabIndex={readOnly ? 0 : undefined}
                        role={readOnly ? 'button' : undefined}
                        aria-label={readOnly ? `Abrir anime ${watchingAnime?.titol || 'Actualmente viendo'}` : undefined}
                    >
                        <img src={watchingAnime?.imatge_portada || addAnimePlaceholder} alt={watchingAnime?.titol || 'Actualmente viendo'} />
                        {readOnly && (
                            <div className="profile-anime-card-overlay">
                                <span>{watchingAnime.titol || 'Ver detalles'}</span>
                            </div>
                        )}
                        <p>Actualmente viendo</p>
                    </div>
                )}
            </div>
            {
                showSearchModal && (
                    <div className="select-anime-container">
                        <div className="select-anime-overlay">
                            <div className="select-anime-header">
                                <h3>Buscar anime para {searchType === 'favorite' ? 'favorito' : 'recomendado'}</h3>
                                <button className="close-search-button" onClick={closeSearchModal}>Cerrar</button>
                            </div>
                            <input
                                className="select-anime-input"
                                placeholder="Buscar anime..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            {isSearching && <p className="select-anime-status">Buscando...</p>}
                            {searchError && <p className="select-anime-error">{searchError}</p>}
                            {!isSearching && !searchError && searchQuery.trim() !== '' && searchResults.length === 0 && (
                                <p className="select-anime-empty">No se encontraron resultados.</p>
                            )}
                            <ul className="select-anime-results">
                                {searchResults.map((anime) => {
                                    const normalized = normalizeAnimeResult(anime);
                                    return (
                                        <li key={normalized.id || anime.mal_id || anime.id} className="select-anime-result" onClick={() => handleSelectSearchResult(anime)}>
                                            <img src={normalized.imageUrl || addAnimePlaceholder} alt={normalized.title} />
                                            <div className="select-anime-info">
                                                <span className="perfil-result-title">{normalized.title}</span>
                                                <span className="result-subtitle">{normalized.type} · {normalized.year}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                )
            }
        </div>

    )
}



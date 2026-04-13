import { useState, useEffect } from 'react';
import './ProfilePage.css';
import userIcon from './../../assets/usuari.png';
import { useUserInfo, useAuth } from './../../hooks/useAuth';

export function ProfilePage() {
    let userInfo = useUserInfo();
    const { checkSession } = useAuth();
    const [favoriteAnime, setFavoriteAnime] = useState(null);
    const [recommendedAnime, setRecommendedAnime] = useState(null);
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
                const response = await fetch(`/api/anime/${id}?cacheOnly=true`, {
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
                const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&sfw&limit=10`);
                if (!response.ok) {
                    throw new Error('Error al buscar anime');
                }
                const data = await response.json();
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

    async function handleSelectSearchResult(anime) {
        if (!searchType) return;
        try {
            const response = await fetch('/api/user/anime', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: searchType,
                    id_anime: anime.mal_id
                })
            });
            const data = await response.json();
            if (!data.success) {
                alert('Error al actualizar el anime: ' + (data.error || 'Error desconocido'));
                return;
            }
            await checkSession();
            closeSearchModal();
            actualitzarUserInfo();
            window.location.reload();
        } catch (error) {
            console.error('Error updating favorite/recommended anime:', error);
            alert('No se pudo actualizar el anime. Inténtalo de nuevo.');
        }
    }

    function editPfpView() {
        document.querySelector('.edit-pfp-container').style.display = 'flex';
    };

    function canviarPfp() {
        const newImgUrl = document.querySelector('.edit-pfp-input').value.trim();
        if (!newImgUrl) {
            alert('La URL no puede estar vacía.');
            return;
        }
        fetch('/api/update-profile-picture', {
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
                    window.location.reload();
                } else {
                    alert('Error al actualizar la foto de perfil: ' + (data.error || 'Error desconocido'));
                }
            })
            .catch(error => {
                console.error('Error al actualizar la foto de perfil:', error);
                alert('Error al actualizar la foto de perfil: ' + error.message);
            })
    }

    function actualitzarUserInfo() {
        fetch('/api/check-session', {
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
        <div className="profile-page">
            <div className='edit-pfp-container'>
                <div className='edit-pfp-overlay'>
                    <span className='edit-pfp-text'>Introdueix la URL de la foto de perfil</span>
                    <input type="text" className='edit-pfp-input' placeholder='URL de la foto de perfil' />
                    <button className='edit-pfp-button' onClick={canviarPfp}>Guardar</button>
                    <button className='edit-pfp-button-goback' onClick={() => {
                        document.querySelector('.edit-pfp-container').style.display = 'none';
                    }}>Cancelar</button>
                </div>
            </div>
            <div className="profile-options">
                <label className="selected-page">Perfil</label>
                <button className="not-selected-page">Estadísticas</button>
                <button className="not-selected-page">Configuración</button>
            </div>
            <div className="profile-content">
                <div className="profile-info">
                    <img src={userInfo?.img_url || userIcon} alt="Profile" className="profile-picture" onClick={editPfpView} />
                    <div className="profile-details">
                        <h2>{userInfo?.nom || 'Error al cargar el nombre de usuario'}</h2>
                        <p>{userInfo?.email || 'Error al cargar el email'}</p>
                    </div>
                </div>
                <div className="profile-separator" />
                <div className="profile-anime-list">
                    <div className="anime-card anime-card-clickable" onClick={() => openSearchModal('favorite')}>
                        <img
                            src={
                                favoriteAnime?.imatge_portada ||
                                'https://via.placeholder.com/240x320/111111/ffffff?text=Anime+favorito'
                            }
                            alt={favoriteAnime?.titol || 'Anime favorito'}
                        />
                        <p>Anime favorito</p>
                    </div>
                    <div className="anime-card anime-card-clickable" onClick={() => openSearchModal('recommended')}>
                        <img
                            src={
                                recommendedAnime?.imatge_portada ||
                                'https://via.placeholder.com/240x320/111111/ffffff?text=Anime+recomendado'
                            }
                            alt={recommendedAnime?.titol || 'Anime recomendado'}
                        />
                        <p>Anime recomendado</p>
                    </div>
                    <div className="anime-card">
                        <img src="https://myanimelist.net/images/anime/1071/149486.jpg" alt="Actualmente viendo" />
                        <p>Actualmente viendo</p>
                    </div>
                </div>
                {showSearchModal && (
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
                                {searchResults.map((anime) => (
                                    <li key={anime.mal_id} className="select-anime-result" onClick={() => handleSelectSearchResult(anime)}>
                                        <img src={anime.images?.jpg?.image_url} alt={anime.title} />
                                        <div className="select-anime-info">
                                            <span className="result-title">{anime.title}</span>
                                            <span className="result-subtitle">{anime.type} · {anime.year || 'Año desconocido'}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

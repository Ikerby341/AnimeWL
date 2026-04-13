import { useState, useEffect } from 'react';
import './ProfilePage.css';
import userIcon from './../../assets/usuari.png';
import { useUserInfo } from './../../hooks/useAuth'

export function ProfilePage() {
    const userInfo = useUserInfo();
    const [favoriteAnime, setFavoriteAnime] = useState(null);
    const [recommendedAnime, setRecommendedAnime] = useState(null);

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

    return (
        <div className="profile-page">
            <div className="profile-options">
                <label className="selected-page">Perfil</label>
                <button className="not-selected-page">Estadísticas</button>
                <button className="not-selected-page">Configuración</button>
            </div>
            <div className="profile-content">
                <div className="profile-info">
                    <img src={userIcon} alt="Profile" className="profile-picture" />
                    <div className="profile-details">
                        <h2>{userInfo?.nom || 'Error al cargar el nombre de usuario'}</h2>
                        <p>{userInfo?.email || 'Error al cargar el email'}</p>
                    </div>
                </div>
                <div className="profile-separator" />
                <div className="profile-anime-list">
                    <div className="anime-card">
                        <img
                            src={
                                favoriteAnime?.imatge_portada ||
                                'https://via.placeholder.com/240x320/111111/ffffff?text=Anime+favorito'
                            }
                            alt={favoriteAnime?.titol || 'Anime favorito'}
                        />
                        <p>{favoriteAnime?.titol || 'Anime favorito'}</p>
                    </div>
                    <div className="anime-card">
                        <img
                            src={
                                recommendedAnime?.imatge_portada ||
                                'https://via.placeholder.com/240x320/111111/ffffff?text=Anime+recomendado'
                            }
                            alt={recommendedAnime?.titol || 'Anime recomendado'}
                        />
                        <p>{recommendedAnime?.titol || 'Anime recomendado'}</p>
                    </div>
                    <div className="anime-card">
                        <img src="https://myanimelist.net/images/anime/1071/149486.jpg" alt="Actualmente viendo" />
                        <p>Actualmente viendo</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

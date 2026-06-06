import './ProfilePage.css';
import Perfil from '../Perfil/Perfil.jsx';
import { Configuracio } from '../Configuracion/Configuracion.jsx';
import { Estadistiques } from '../Estadisticas/Estadisticas.jsx';
import { useEffect, useState } from 'react';

function PaginaPerfil({ activeView = 'Perfil', onViewChange = () => {} }) {
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    const carregarFavorits = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/favorites`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success && data.favorites) {
          setFavoritos(data.favorites);
        }
      } catch (err) {
        console.error('Error loading favorites for profile:', err);
      }
    };

    carregarFavorits();
  }, []);

  return (
    <div className="profile-page">
            <div className="profile-options">
                <button
          className={activeView === 'Perfil' ? 'selected-page' : 'not-selected-page'}
          onClick={() => onViewChange('Perfil')}>
          
                    Perfil
                </button>
                <button
          className={activeView === 'Estadisticas' ? 'selected-page' : 'not-selected-page'}
          onClick={() => onViewChange('Estadisticas')}>
          
                    Estadísticas
                </button>
                <button
          className={activeView === 'Configuracion' ? 'selected-page' : 'not-selected-page'}
          onClick={() => onViewChange('Configuracion')}>
          
                    Configuración
                </button>
            </div>

            <div className="profile-content">
                {activeView === 'Perfil' && <Perfil profileFavorites={favoritos} />}

                {activeView === 'Estadisticas' && <Estadistiques />}

                {activeView === 'Configuracion' && <Configuracio />}
            </div>
        </div>);

}export { PaginaPerfil };

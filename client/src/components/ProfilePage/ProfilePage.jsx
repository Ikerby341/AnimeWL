import './ProfilePage.css';
import { Perfil } from '../Perfil/Perfil.jsx';
import { Configuracion } from '../Configuracion/Configuracion.jsx';
import { Estadisticas } from '../Estadisticas/Estadisticas.jsx';

export function ProfilePage({ activeView = 'Perfil', onViewChange = () => {} }) {
    return (
        <div className="profile-page">
            <div className="profile-options">
                <button
                    className={activeView === 'Perfil' ? 'selected-page' : 'not-selected-page'}
                    onClick={() => onViewChange('Perfil')}
                >
                    Perfil
                </button>
                <button
                    className={activeView === 'Estadisticas' ? 'selected-page' : 'not-selected-page'}
                    onClick={() => onViewChange('Estadisticas')}
                >
                    Estadísticas
                </button>
                <button
                    className={activeView === 'Configuracion' ? 'selected-page' : 'not-selected-page'}
                    onClick={() => onViewChange('Configuracion')}
                >
                    Configuración
                </button>
            </div>

            <div className="profile-content">
                {activeView === 'Perfil' && <Perfil />}

                {activeView === 'Estadisticas' && <Estadisticas />}

                {activeView === 'Configuracion' && <Configuracion />}
            </div>
        </div>
    );
}

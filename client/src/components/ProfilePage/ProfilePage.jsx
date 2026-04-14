import { useState } from 'react';
import './ProfilePage.css';
import { Perfil } from '../Perfil/Perfil.jsx';
import { Configuracion } from '../Configuracion/Configuracion.jsx';

export function ProfilePage() {
    const [activeView, setActiveView] = useState('Perfil');

    return (
        <div className="profile-page">
            <div className="profile-options">
                <button
                    className={activeView === 'Perfil' ? 'selected-page' : 'not-selected-page'}
                    onClick={() => setActiveView('Perfil')}
                >
                    Perfil
                </button>
                <button
                    className={activeView === 'Estadisticas' ? 'selected-page' : 'not-selected-page'}
                    onClick={() => setActiveView('Estadisticas')}
                >
                    Estadísticas
                </button>
                <button
                    className={activeView === 'Configuracion' ? 'selected-page' : 'not-selected-page'}
                    onClick={() => setActiveView('Configuracion')}
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

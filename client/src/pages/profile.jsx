import { useState } from 'react';
import { Navbar } from '../components/NavBar/NavBar.jsx';
import { ProfilePage } from '../components/ProfilePage/ProfilePage.jsx';
import { useIsLoggedIn } from '../hooks/useAuth';
import Footer from '../components/Footer/Footer.jsx';
import '../styles/profile.css';

const PROFILE_VIEWS = [
    { id: 'Perfil', label: 'Perfil' },
    { id: 'Estadisticas', label: 'Estadísticas' },
    { id: 'Configuracion', label: 'Configuración' },
];

export default function Profile() {
    const isLoggedIn = useIsLoggedIn();
    const [activeView, setActiveView] = useState('Perfil');

    if (!isLoggedIn) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="not-logged-in">
                    <h2>No has iniciado sesión</h2>
                    <p>Por favor, inicia sesión para ver tu perfil.</p>
                    <button className='buttonProfileLogin' onClick={() => window.location.href = '/login'}>Iniciar sesión</button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Navbar
                profile={false}
                searchBar={false}
                favorites={false}
                directory={false}
                profileMenuItems={PROFILE_VIEWS}
                activeProfileView={activeView}
                onProfileViewChange={setActiveView}
            />
            <ProfilePage activeView={activeView} onViewChange={setActiveView} />
            <Footer />
        </div>
    );
}

import { useState } from 'react';
import { BarraNavegacio } from '../components/NavBar/NavBar.jsx';
import { PaginaPerfil } from '../components/ProfilePage/ProfilePage.jsx';
import { useEstaConnectat } from '../hooks/useAuth';
import PeuPagina from '../components/Footer/Footer.jsx';
import '../styles/profile.css';

const PROFILE_VIEWS = [
{ id: 'Perfil', label: 'Perfil' },
{ id: 'Estadisticas', label: 'Estadísticas' },
{ id: 'Configuracion', label: 'Configuración' }];


function PerfilUsuari() {
  const isLoggedIn = useEstaConnectat();
  const [activeView, setActiveView] = useState('Perfil');

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="not-logged-in">
                    <h2>No has iniciado sesión</h2>
                    <p>Por favor, inicia sesión para ver tu perfil.</p>
                    <button className='buttonProfileLogin' onClick={() => window.location.href = '/login'}>Iniciar sesión</button>
                </div>
                <PeuPagina />
            </div>);

  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <BarraNavegacio
        profile={false}
        searchBar={false}
        favorites={false}
        directory={false}
        profileMenuItems={PROFILE_VIEWS}
        activeProfileView={activeView}
        onProfileViewChange={setActiveView} />
      
            <PaginaPerfil activeView={activeView} onViewChange={setActiveView} />
            <PeuPagina />
        </div>);

}export { PerfilUsuari as default };
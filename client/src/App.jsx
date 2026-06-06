import { Navigate, Routes, Route } from 'react-router-dom';
import Inici from './pages/home.jsx';
import IniciSessio from './pages/login.jsx';
import Registre from './pages/register.jsx';
import Directori from './pages/directory.jsx';
import Favorits from './pages/favorites.jsx';
import JocAnimedle from './pages/Animedle.jsx';
import PerfilUsuari from './pages/profile.jsx';
import PerfilPublic from './pages/publicProfile.jsx';
import Detalls from './pages/details.jsx';
import OblidarContrasenya from './pages/ForgotPassword.jsx';
import RestablirContrasenya from './pages/ResetPassword.jsx';
import GestioUsuaris from './pages/adminUsers.jsx';
import Termes from './pages/Terms.jsx';
import Privadesa from './pages/Privacy.jsx';
import { ProveidorAutenticacio } from './contexts/AuthContext.jsx';
import { ProveidorNotificacions } from './contexts/ToastContext.jsx';

function App() {
  return (
    <ProveidorAutenticacio>
      <ProveidorNotificacions>
        <Routes>
          <Route path="/" element={<Inici />} />
          <Route path='/login' element={<IniciSessio />} />
          <Route path='/register' element={<Registre />} />
          <Route path='/directory' element={<Directori />} />
          <Route path='/favorites' element={<Favorits />} />
          <Route path='/animedle' element={<JocAnimedle />} />
          <Route path='/profile' element={<PerfilUsuari />} />
          <Route path='/profile/:userId' element={<PerfilPublic />} />
          <Route path='/details/:id' element={<Detalls />} />
          <Route path='/forgot-password' element={<OblidarContrasenya />} />
          <Route path='/reset-password' element={<RestablirContrasenya />} />
          <Route path='/admin/users' element={<GestioUsuaris />} />
          <Route path='/terminos-y-condiciones' element={<Termes />} />
          <Route path='/politica-de-privacidad' element={<Privadesa />} />
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </ProveidorNotificacions>
    </ProveidorAutenticacio>);

}

export default App;

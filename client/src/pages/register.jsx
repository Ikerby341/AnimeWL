import { Navigate } from 'react-router-dom';
import { BarraNavegacio } from '../components/NavBar/NavBar.jsx';
import { FormulariRegistre } from '../components/RegisterForm/RegisterForm.jsx';
import PeuPagina from '../components/Footer/Footer.jsx';
import { useAutenticacio } from '../hooks/useAuth.js';
import '../styles/register.css';

function Registre() {
  const { isLoggedIn, loading } = useAutenticacio();

  if (loading) {
    return null;
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <BarraNavegacio profile={false} searchBar={false} favorites={false} directory={false} />
            <div className="content">
                <br />
                <h1 className="title">REGISTRARSE</h1>
                <FormulariRegistre />
            </div>
            <PeuPagina />
        </div>);

}export { Registre as default };
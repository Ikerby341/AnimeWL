import { Navigate } from 'react-router-dom';
import { Navbar } from '../components/NavBar/NavBar.jsx';
import { LoginForm } from '../components/LoginForm/LoginForm.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/login.css'

export default function Login() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Navbar profile={false} searchBar={false} favorites={false} directory={false} />
      <div className="content">
        <br />
        <h1 className="title">INICIAR SESIÓN</h1>
        <LoginForm />
      </div>
      <Footer />
    </div>
  )
}

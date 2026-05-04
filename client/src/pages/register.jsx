import { Navigate } from 'react-router-dom';
import { Navbar } from '../components/NavBar/NavBar.jsx';
import { RegisterForm } from '../components/RegisterForm/RegisterForm.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/register.css'

export default function Register() {
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
                <h1 className="title">REGISTRARSE</h1>
                <RegisterForm />
            </div>
            <Footer />
        </div>
    )
}

import { Navbar } from '../components/NavBar/NavBar.jsx';
import { ProfilePage } from '../components/ProfilePage/ProfilePage.jsx';
import { useIsLoggedIn } from '../hooks/useAuth';
import '../styles/profile.css';

export default function Profile() {
    const isLoggedIn = useIsLoggedIn();

    if (!isLoggedIn) {
        return (
            <div className="not-logged-in">
                <h2>No has iniciado sesión</h2>
                <p>Por favor, inicia sesión para ver tu perfil.</p>
            </div>
        );
    }

    return (
        <div>
            <Navbar profile={false} searchBar={false} favorites={false} directory={false} />
            <ProfilePage />
        </div>
    );
}

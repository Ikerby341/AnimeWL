import { Navbar } from '../components/NavBar/NavBar.jsx';
import { ProfilePage } from '../components/ProfilePage/ProfilePage.jsx';

export default function Profile() {
    return (
        <div>
            <Navbar profile={false} searchBar={false} favorites={false} directory={false} />
            <ProfilePage />
        </div>
    )
}
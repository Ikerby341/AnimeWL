import { Navbar } from '../components/NavBar/NavBar.jsx';

export default function Profile() {
    return (
        <Navbar profile={false} searchBar={false} favorites={false} directory={false} />
    )
}
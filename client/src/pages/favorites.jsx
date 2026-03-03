import { Navbar } from '../components/NavBar/NavBar.jsx';
import '../styles/favorites.css'

export default function Favorites() {
  return (
    <div>
      <Navbar favorites={false} />
      <div className="content">
        <br />
        <h1>FAVORITOS</h1>
      </div>
    </div>
  )
}
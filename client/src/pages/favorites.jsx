import { Navbar } from '../components/NavBar/NavBar.jsx';
import Footer from '../components/Footer/Footer.jsx';
import '../styles/favorites.css'

export default function Favorites() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Navbar favorites={false} />
      <div className="content">
        <br />
        <h1>FAVORITOS</h1>
      </div>
      <Footer />
    </div>
  )
}
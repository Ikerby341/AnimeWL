import logo from './../../assets/LogoSuperior.webp'
import userIcon from './../../assets/usuari.png'
import favoriteIcon from './../../assets/favorito.png'
import directoryIcon from './../../assets/directorio.png'
import { ButtonNavBar } from './../ButtonNavBar/ButtonNavBar'
import { Link } from 'react-router-dom'
import './NavBar.css'

export function Navbar({ searchBar = true, directory = true, favorites = true, profile = true }) {
  return (
      <nav className="navbar">
        <div className="navbarDiv">
          <Link to="/"> <img src={logo} alt="Logo" className="logo" /></Link>
          {searchBar && <input type="text" placeholder="Buscar anime..." className="searchBar" aria-label='Barra de busqueda' />}
        </div>
        <div className="navbarDiv">
          {directory && < ButtonNavBar link="/directory" img={directoryIcon} />}
          {favorites && < ButtonNavBar link="/favorites" img={favoriteIcon} />}
          {profile && < ButtonNavBar link="/profile" img={userIcon} paddingLeft="0.5rem" />}
        </div>
      </nav>
  )
}
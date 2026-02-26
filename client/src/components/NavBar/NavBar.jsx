import logo from './../../assets/LogoSuperior.webp'
import userIcon from './../../assets/usuari.png'
import favoriteIcon from './../../assets/favorito.png'
import directoryIcon from './../../assets/directorio.png'
import { ButtonNavBar } from './../ButtonNavBar/ButtonNavBar'
import './NavBar.css'

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbarDiv">
        <img src={logo} alt="Logo" className="logo" />
        <input type="text" placeholder="Buscar anime..." className="searchBar" />
      </div>
      <div className="navbarDiv">
        < ButtonNavBar img={directoryIcon} />
        < ButtonNavBar img={favoriteIcon} />
        < ButtonNavBar img={userIcon} paddingLeft="0.5rem" />
      </div>
    </nav>
  )
}
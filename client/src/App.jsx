import './styles/App.css'
import logo from './assets/logo.png'
import userIcon from './assets/usuari.png'
import favoriteIcon from './assets/favorito.png'
import directoryIcon from './assets/directorio.png'

function App() {
  return (
    <>
      <Navbar />
    </>
  )
}

function Navbar() {
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

function ButtonNavBar({ img, paddingLeft }) {
  return (
      <button className="buttonNavBar" style={{ paddingLeft: paddingLeft }}>
        <img src={img} alt="Icon" className="icon" />
      </button>
  )
}
export default App

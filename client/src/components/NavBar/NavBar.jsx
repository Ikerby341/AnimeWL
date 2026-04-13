import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from './../../assets/LogoSuperior.webp';
import userIcon from './../../assets/usuari.png';
import favoriteIcon from './../../assets/favorito.png';
import directoryIcon from './../../assets/directorio.png';
import { ButtonNavBar } from './../ButtonNavBar/ButtonNavBar';
import { useAuth, useUserInfo } from '../../hooks/useAuth.js';
import './NavBar.css';

export function Navbar({ searchBar = true, directory = true, favorites = true, profile = true }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const wrapperRef = useRef(null);
  const userMenuRef = useRef(null);

  // cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    if (query.trim() === '') {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&sfw&limit=10`);
        const data = await res.json();
        setResults(data.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('search error', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(anime) {
    // navegar hacia la página de detalles; el endpoint /api/anime/:id se
    // encargará de sincronizar en caso de faltar información en la BBDD
    setQuery('');
    setShowDropdown(false);
    navigate(`/details/${anime.mal_id}`);
  }

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    logout();
  };

  const userInfo = useUserInfo();

  return (
    <nav className="navbar" ref={wrapperRef}>
      <div className="navbarDiv">
        <Link to="/"> <img src={logo} alt="Logo" className="logo" /></Link>
        {searchBar && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar anime..."
              className="searchBar"
              aria-label="Barra de busqueda"
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                if (val.trim() === '') {
                  setResults([]);
                  setShowDropdown(false);
                }
              }}
            />
            {showDropdown && results.length > 0 && (
              <ul className="search-results">
                {results.map((r) => (
                  <li key={r.mal_id} onClick={() => handleSelect(r)}>
                    <img
                      src={r.images?.jpg?.image_url}
                      alt={r.title}
                      className="result-thumb"
                    />
                    <span className="result-title">{r.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="navbarDiv">
        {directory && < ButtonNavBar link="/directory" img={directoryIcon} />}
        {userInfo && favorites && < ButtonNavBar link="/favorites" img={favoriteIcon} />}
        {profile && (
          <div className="user-menu-container" ref={userMenuRef}>
            <button
              onClick={handleUserMenuToggle}
              className="user-menu-button"
              title={user ? `Usuario: ${user.nom}` : 'Iniciar sesión'}
            >
              <img src={userInfo?.img_url || userIcon} alt="User" className="user-icon" />
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                {user ? (
                  <>
                    <div className="user-info">
                      <span className="user-name">{user.nom}</span>
                    </div>
                    <button onClick={handleProfileClick} className="dropdown-item">
                      Perfil
                    </button>
                    <button onClick={handleLogoutClick} className="dropdown-item logout-item">
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <div>
                    <button onClick={() => navigate('/login')} className="dropdown-item">
                      Iniciar sesión
                    </button>
                    <button onClick={() => navigate('/register')} className="dropdown-item">
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
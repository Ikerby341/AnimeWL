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


  function normalizeSearchResult(anime) {
    const title = anime.title || anime.titol || anime.name || 'Anime desconocido';
    const imageUrl = anime.images?.jpg?.image_url || anime.imatge_portada || anime.image_url || '';
    const id = anime.mal_id || anime.id_anime || anime.id || null;
    return { title, imageUrl, id };
  }

  useEffect(() => {
    if (query.trim() === '') {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/jikan/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          console.error('search error', res.status);
          return;
        }
        const data = await res.json();
        if (!data.success) {
          console.error('search error', data.error);
          return;
        }
        setResults(data.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('search error', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(anime) {
    const normalized = normalizeSearchResult(anime);
    if (!normalized.id) {
      return;
    }
    setQuery('');
    setShowDropdown(false);
    navigate(`/details/${normalized.id}`);
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
                {results.map((r) => {
                  const normalized = normalizeSearchResult(r);
                  return (
                    <li key={normalized.id || r.mal_id || r.id} onClick={() => handleSelect(r)}>
                      <img
                        src={normalized.imageUrl}
                        alt={normalized.title}
                        className="result-thumb"
                      />
                      <span className="result-title">{normalized.title}</span>
                    </li>
                  );
                })}
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
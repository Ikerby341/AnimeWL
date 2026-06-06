import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logo from './../../assets/LogoSuperior.webp';
import mobileLogo from './../../assets/LogoAnimeWLCuadrado.webp';
import userIcon from './../../assets/usuari.webp';
import { BotoBarraNavegacio } from './../ButtonNavBar/ButtonNavBar';
import { useAutenticacio, useDadesUsuari } from '../../hooks/useAuth.js';
import { IconaCor, IconaDisc, IconaComandament } from '../Icons/Icons.jsx';
import './NavBar.css';

const MOBILE_BREAKPOINT = 768;
const PROFILE_MENU_BREAKPOINT = 980;

function obtenirAmpladaFinestra() {
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : MOBILE_BREAKPOINT + 1;
  const screenWidth = typeof window !== 'undefined' && window.screen ? window.screen.width : windowWidth;
  return Math.min(windowWidth, screenWidth);
}

function BarraNavegacio({
  searchBar = true,
  directory = true,
  favorites = true,
  profile = true,
  profileMenuItems = [],
  activeProfileView = '',
  onProfileViewChange
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() => obtenirAmpladaFinestra() <= MOBILE_BREAKPOINT);
  const [isProfileMenuViewport, setIsProfileMenuViewport] = useState(() => obtenirAmpladaFinestra() <= PROFILE_MENU_BREAKPOINT);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAutenticacio();
  const wrapperRef = useRef(null);
  const userMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  // cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const gestionarRedimensio = () => {
      const viewportWidth = obtenirAmpladaFinestra();
      const mobile = viewportWidth <= MOBILE_BREAKPOINT;
      const profileMenuViewport = viewportWidth <= PROFILE_MENU_BREAKPOINT;
      setIsMobileViewport(mobile);
      setIsProfileMenuViewport(profileMenuViewport);
      if (!mobile) {
        setMobileSearchOpen(false);
      }
      if (!profileMenuViewport) {
        setShowProfileMenu(false);
      }
    };

    gestionarRedimensio();
    window.addEventListener('resize', gestionarRedimensio);
    window.addEventListener('orientationchange', gestionarRedimensio);
    return () => {
      window.removeEventListener('resize', gestionarRedimensio);
      window.removeEventListener('orientationchange', gestionarRedimensio);
    };
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

  function seleccionarAnime(anime) {
    const normalized = normalizeSearchResult(anime);
    if (!normalized.id) {
      return;
    }
    setQuery('');
    setShowDropdown(false);
    navigate(`/details/${normalized.id}`);
  }

  const alternarMenuUsuari = () => {
    setShowUserMenu(!showUserMenu);
  };

  const obrirPerfilUsuari = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const obrirGestioUsuaris = () => {
    setShowUserMenu(false);
    navigate('/admin/users');
  };

  const tancarSessioUsuari = () => {
    setShowUserMenu(false);
    logout();
  };

  const gestionarClicLogo = (event) => {
    if (location.pathname === '/') {
      event.preventDefault();
      window.location.reload();
    }
  };

  const userInfo = useDadesUsuari();
  const currentLogo = isMobileViewport ? mobileLogo : logo;
  const logoClassName = isMobileViewport ? 'logo logo-mobile' : 'logo';
  const navbarClassName = isMobileViewport ? 'navbar navbar-mobile' : 'navbar';
  const navbarDivClassName = isMobileViewport ? 'navbarDiv navbarDiv-mobile' : 'navbarDiv';
  const searchContainerClassName = isMobileViewport ? 'search-container search-container-mobile' : 'search-container';
  const mobileActionsClassName = isMobileViewport ? 'navbarDiv navbarDiv-mobile navbar-actions-mobile' : 'navbarDiv navbar-actions-desktop';
  const shouldShowInlineSearch = searchBar && !isMobileViewport;
  const shouldShowMobileSearch = searchBar && isMobileViewport && mobileSearchOpen;
  const shouldShowProfileMobileMenu = isProfileMenuViewport && profileMenuItems.length > 0 && onProfileViewChange;
  const shouldShowAnimedleButton = userInfo && location.pathname !== '/animedle';

  return (
    <nav className={navbarClassName} ref={wrapperRef}>
      <div className={navbarDivClassName}>
        <Link to="/" onClick={gestionarClicLogo}>
          <img src={currentLogo} alt="Logo AnimeWL" className={logoClassName} />
        </Link>
        {shouldShowProfileMobileMenu &&
        <div className="profile-mobile-menu-container" ref={profileMenuRef}>
            <button
            type="button"
            className={`profile-mobile-menu-toggle ${showProfileMenu ? 'profile-mobile-menu-toggle-active' : ''}`}
            aria-label="Abrir menu de perfil"
            aria-expanded={showProfileMenu}
            onClick={() => setShowProfileMenu((prev) => !prev)}>
            
              <span />
              <span />
              <span />
            </button>
            {showProfileMenu &&
          <div className="profile-mobile-dropdown">
                {profileMenuItems.map((item) =>
            <button
              key={item.id}
              type="button"
              className={`profile-mobile-dropdown-item${activeProfileView === item.id ? ' profile-mobile-dropdown-item-active' : ''}`}
              onClick={() => {
                onProfileViewChange(item.id);
                setShowProfileMenu(false);
              }}>
              
                    {item.label}
                  </button>
            )}
              </div>
          }
          </div>
        }
        {shouldShowInlineSearch &&
        <div className={searchContainerClassName}>
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
            }} />
          
            {showDropdown && results.length > 0 &&
          <ul className="search-results">
                {results.map((r) => {
              const normalized = normalizeSearchResult(r);
              return (
                <li key={normalized.id || r.mal_id || r.id} onClick={() => seleccionarAnime(r)}>
                      <img
                    src={normalized.imageUrl}
                    alt={normalized.title}
                    className="result-thumb" />
                  
                      <span className="result-title">{normalized.title}</span>
                    </li>);

            })}
              </ul>
          }
          </div>
        }
      </div>
      <div className={mobileActionsClassName}>
        {searchBar && isMobileViewport &&
        <button
          type="button"
          className={`mobile-search-toggle ${mobileSearchOpen ? 'mobile-search-toggle-active' : ''}`}
          aria-label={mobileSearchOpen ? 'Ocultar busqueda' : 'Mostrar busqueda'}
          onClick={() => {
            setMobileSearchOpen((prev) => !prev);
            setShowDropdown(false);
          }}>
          
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16L21 21" />
            </svg>
          </button>
        }
        {shouldShowAnimedleButton && <BotoBarraNavegacio link="/animedle" icon={<IconaComandament size={28} strokeWidth={1} />} ariaLabel="Animedle" />}
        {directory && <BotoBarraNavegacio link="/directory" icon={<IconaDisc size={24} strokeWidth={1} />} ariaLabel="Directorio" />}
        {userInfo && favorites && <BotoBarraNavegacio link="/favorites" icon={<IconaCor size={24} strokeWidth={1} />} ariaLabel="Favoritos" />}
        {profile &&
        <div className="user-menu-container" ref={userMenuRef}>
            <button
            onClick={alternarMenuUsuari}
            className="user-menu-button"
            title={user ? `Usuario: ${user.nom}` : 'Iniciar sesión'}>
            
              <img src={userInfo?.img_url || userIcon} alt="User" className="user-icon" />
            </button>
            {showUserMenu &&
          <div className="user-dropdown">
                {user ?
            <>
                    <div className="user-info">
                      <span className="user-name">{user.nom}</span>
                    </div>
                    <button onClick={obrirPerfilUsuari} className="dropdown-item">
                      Perfil
                    </button>
                    {user.isAdmin === true &&
              <button onClick={obrirGestioUsuaris} className="dropdown-item">
                        Gestión de usuarios
                      </button>
              }
                    <button onClick={tancarSessioUsuari} className="dropdown-item logout-item">
                      Cerrar sesión
                    </button>
                  </> :

            <div>
                    <button onClick={() => navigate('/login')} className="dropdown-item">
                      Iniciar sesión
                    </button>
                    <button onClick={() => navigate('/register')} className="dropdown-item">
                      Registrarse
                    </button>
                  </div>
            }
              </div>
          }
          </div>
        }
      </div>
      {shouldShowMobileSearch &&
      <div className="search-container search-container-mobile-panel">
          <input
          type="text"
          placeholder="Buscar anime..."
          className="searchBar searchBar-mobile-panel"
          aria-label="Barra de busqueda"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (val.trim() === '') {
              setResults([]);
              setShowDropdown(false);
            }
          }} />
        
          {showDropdown && results.length > 0 &&
        <ul className="search-results search-results-mobile">
              {results.map((r) => {
            const normalized = normalizeSearchResult(r);
            return (
              <li key={normalized.id || r.mal_id || r.id} onClick={() => seleccionarAnime(r)}>
                    <img
                  src={normalized.imageUrl}
                  alt={normalized.title}
                  className="result-thumb" />
                
                    <span className="result-title">{normalized.title}</span>
                  </li>);

          })}
            </ul>
        }
        </div>
      }
    </nav>);

}export { BarraNavegacio };
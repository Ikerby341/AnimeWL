import { Navbar } from '../components/NavBar/NavBar.jsx';
import { Carrusel } from '../components/Carrusel/Carrusel.jsx';
import Footer from '../components/Footer/Footer.jsx';
import '../styles/home.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimeCoverInLine } from '../components/AnimeCoverInLine/AnimeCoverInLine.jsx'

const MOBILE_BREAKPOINT = 768;

function getViewportWidth() {
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : MOBILE_BREAKPOINT + 1;
  const screenWidth = typeof window !== 'undefined' && window.screen ? window.screen.width : windowWidth;
  return Math.min(windowWidth, screenWidth);
}

function Home() {
  const navigate = useNavigate();
  const [actionAnimes, setActionAnimes] = useState([]);
  const [fantasyAnimes, setFantasyAnimes] = useState([]);
  const [romanceAnimes, setRomanceAnimes] = useState([]);
  const [SportsAnimes, setSportsAnimes] = useState([]);
  const [recentAnimes, setRecentAnimes] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingAction, setLoadingAction] = useState(true);
  const [loadingFantasy, setLoadingFantasy] = useState(true);
  const [loadingRomance, setLoadingRomance] = useState(true);
  const [loadingSports, setLoadingSports] = useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(() => getViewportWidth() <= MOBILE_BREAKPOINT);

  function handleSelect(anime) {
    const id = anime.id_anime || anime.id;
    if (id) {
      navigate(`/details/${id}`);
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(getViewportWidth() <= MOBILE_BREAKPOINT);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const recentRes = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/recent/5`);
        if (!recentRes.ok) throw new Error('failed to fetch recent animes');
        const recentBody = await recentRes.json();
        if (!cancelled) {
          const recentList = recentBody.anime || [];
          setRecentAnimes(recentList);
          setLoadingRecent(false);
        }

        const res = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/genre/action/7`);
        if (!res.ok) throw new Error('failed to fetch');
        const body = await res.json();
        if (!cancelled) {
          const list = body.anime || [];
          setActionAnimes(list);
          setLoadingAction(false);
        }
        const res2 = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/genre/fantasy/7`);
        if (!res2.ok) throw new Error('failed to fetch');
        const body2 = await res2.json();
        if (!cancelled) {
          const list = body2.anime || [];
          setFantasyAnimes(list);
          setLoadingFantasy(false);
        }
        const res3 = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/genre/romance/7`);
        if (!res3.ok) throw new Error('failed to fetch');
        const body3 = await res3.json();
        if (!cancelled) {
          const list = body3.anime || [];
          setRomanceAnimes(list);
          setLoadingRomance(false);
        }
        const res4 = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/genre/sports/7`);
        if (!res4.ok) throw new Error('failed to fetch');
        const body4 = await res4.json();
        if (!cancelled) {
          const list = body4.anime || [];
          setSportsAnimes(list);
          setLoadingSports(false);
        }

      } catch (err) {
        console.error('load animes error', err);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const contentClassName = isMobileViewport ? 'content content-mobile' : 'content';
  const gridClassName = isMobileViewport ? 'anime-grid-inline anime-grid-inline-mobile' : 'anime-grid-inline';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Navbar />
      <div className={contentClassName}>
        {loadingRecent ? (
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        ) : (
          <Carrusel items={recentAnimes.map((a) => ({
            imageUrl: a.imatge_portada || '',
            title: a.titol || '---',
            subtitle: a.estat || 'Reciente',
            episodeCount: a.episodeCount || 0,
            synopsis: a.sinopsi_es || a.sinopsi || '',
            showStar: true,
            id_anime: a.id_anime,
          }))} onItemClick={handleSelect} />
        )}
        <br />
        <h2>ACCIÓN</h2>
        {loadingAction ? (
                  <div className="loading-container">
                    <div className="loader"></div>
                  </div>
                ) : (
                  <div className={gridClassName}>
                    {actionAnimes.map((a) => (
                      <AnimeCoverInLine
                        key={a.id_anime || a.id}
                        imageUrl={a.imatge_portada || a.imageUrl || ''}
                        title={a.titol || a.title || '---'}
                        synopsis={a.sinopsi_es || a.sinopsi || ''}
                        episodeCount={a.episodeCount}
                        onClick={() => handleSelect(a)}
                      />
                    ))}
                  </div>
                )}
                <br />
        <h2>ROMANCE</h2>
        {loadingRomance ? (
                  <div className="loading-container">
                    <div className="loader"></div>
                  </div>
                ) : (
                  <div className={gridClassName}>
                    {romanceAnimes.map((a) => (
                      <AnimeCoverInLine
                        key={a.id_anime || a.id}
                        imageUrl={a.imatge_portada || a.imageUrl || ''}
                        title={a.titol || a.title || '---'}
                        synopsis={a.sinopsi_es || a.sinopsi || ''}
                        episodeCount={a.episodeCount}
                        onClick={() => handleSelect(a)}
                      />
                    ))}
                  </div>
                )}
                <br />
        <h2>FANTASÍA</h2>
        {loadingFantasy ? (
                  <div className="loading-container">
                    <div className="loader"></div>
                  </div>
                ) : (
                  <div className={gridClassName}>
                    {fantasyAnimes.map((a) => (
                      <AnimeCoverInLine
                        key={a.id_anime || a.id}
                        imageUrl={a.imatge_portada || a.imageUrl || ''}
                        title={a.titol || a.title || '---'}
                        synopsis={a.sinopsi_es || a.sinopsi || ''}
                        episodeCount={a.episodeCount}
                        onClick={() => handleSelect(a)}
                      />
                    ))}
                  </div>
                )}
                <br />
          <h2>DEPORTES</h2>
          {loadingSports ? (
                    <div className="loading-container">
                      <div className="loader"></div>
                      </div>
                      ) : (
                        <div className={gridClassName}>
                          {SportsAnimes.map((a) => (
                            <AnimeCoverInLine
                              key={a.id_anime || a.id}
                              imageUrl={a.imatge_portada || a.imageUrl || ''}
                              title={a.titol || a.title || '---'}
                              synopsis={a.sinopsi_es || a.sinopsi || ''}
                              episodeCount={a.episodeCount}
                              onClick={() => handleSelect(a)}
                            />
                          ))}
                        </div>
                      )}
      </div>
      <Footer />
    </div>
  );
}

export default Home;

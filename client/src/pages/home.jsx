import { BarraNavegacio } from '../components/NavBar/NavBar.jsx';
import { Carrusel } from '../components/Carrusel/Carrusel.jsx';
import PeuPagina from '../components/Footer/Footer.jsx';
import '../styles/home.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CobertaAnimeEnLinia } from '../components/AnimeCoverInLine/AnimeCoverInLine.jsx';

const MOBILE_BREAKPOINT = 768;

function normalitzarTextGenere(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function trobarIdGenere(genres, candidates) {
  const normalizedCandidates = candidates.map(normalitzarTextGenere);
  const found = genres.find((genre) => {
    const id = normalitzarTextGenere(genre.id_genere);
    const name = normalitzarTextGenere(genre.nom);
    return normalizedCandidates.includes(id) || normalizedCandidates.includes(name);
  });

  return found?.id_genere || null;
}

async function carregarAnimePerGenere(genreId, limit = 7) {
  const response = await fetch(
    `${import.meta.env.VITE_BACKENDURL}/api/anime?limit=${limit}&offset=0&genre=${encodeURIComponent(genreId)}&minRating=0&maxRating=5`
  );
  if (!response.ok) {
    throw new Error(`failed to fetch genre ${genreId}`);
  }

  const body = await response.json();
  return Array.isArray(body.anime) ? body.anime : [];
}

function obtenirAmpladaFinestra() {
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : MOBILE_BREAKPOINT + 1;
  const screenWidth = typeof window !== 'undefined' && window.screen ? window.screen.width : windowWidth;
  return Math.min(windowWidth, screenWidth);
}

function Inici() {
  const navigate = useNavigate();
  const [actionAnimes, setActionAnimes] = useState([]);
  const [fantasyAnimes, setFantasyAnimes] = useState([]);
  const [romanceAnimes, setRomanceAnimes] = useState([]);
  const [SportsAnimes, setSportsAnimes] = useState([]);
  const [airingAnimes, setAiringAnimes] = useState([]);
  const [recentAnimes, setRecentAnimes] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingAiring, setLoadingAiring] = useState(true);
  const [loadingAction, setLoadingAction] = useState(true);
  const [loadingFantasy, setLoadingFantasy] = useState(true);
  const [loadingRomance, setLoadingRomance] = useState(true);
  const [loadingSports, setLoadingSports] = useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(() => obtenirAmpladaFinestra() <= MOBILE_BREAKPOINT);

  function seleccionarAnime(anime) {
    const id = anime.id_anime || anime.id;
    if (id) {
      navigate(`/details/${id}`);
    }
  }

  useEffect(() => {
    const gestionarRedimensio = () => {
      setIsMobileViewport(obtenirAmpladaFinestra() <= MOBILE_BREAKPOINT);
    };

    gestionarRedimensio();
    window.addEventListener('resize', gestionarRedimensio);
    window.addEventListener('orientationchange', gestionarRedimensio);

    return () => {
      window.removeEventListener('resize', gestionarRedimensio);
      window.removeEventListener('orientationchange', gestionarRedimensio);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function carregarDades() {
      try {
        const recentRes = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/recommended-random/5`);
        if (!recentRes.ok) throw new Error('failed to fetch recommended carousel animes');
        const recentBody = await recentRes.json();
        if (!cancelled) {
          const recentList = recentBody.anime || [];
          setRecentAnimes(recentList);
          setLoadingRecent(false);
        }

        const airingRes = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/airing/7`);
        if (!airingRes.ok) throw new Error('failed to fetch airing animes');
        const airingBody = await airingRes.json();
        if (!cancelled) {
          const list = airingBody.anime || [];
          setAiringAnimes(list);
          setLoadingAiring(false);
        }

        const genresRes = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/genres`);
        if (!genresRes.ok) throw new Error('failed to fetch genres');
        const genresBody = await genresRes.json();
        const genres = Array.isArray(genresBody.genres) ? genresBody.genres : [];
        const genreRequests = [
          { genreId: trobarIdGenere(genres, ['action', 'accion', 'acction', 'acció', 'acción']), setter: setActionAnimes, setLoading: setLoadingAction },
          { genreId: trobarIdGenere(genres, ['fantasy', 'fantasia', 'fantasía']), setter: setFantasyAnimes, setLoading: setLoadingFantasy },
          { genreId: trobarIdGenere(genres, ['romance', 'romantic', 'romántico', 'romàntic']), setter: setRomanceAnimes, setLoading: setLoadingRomance },
          { genreId: trobarIdGenere(genres, ['sports', 'sport', 'deportes', 'esports']), setter: setSportsAnimes, setLoading: setLoadingSports }
        ];

        await Promise.all(genreRequests.map(async ({ genreId, setter, setLoading }) => {
          try {
            if (!genreId) {
              setter([]);
              return;
            }
            const anime = await carregarAnimePerGenere(genreId, 7);
            if (!cancelled) {
              setter(anime);
            }
          } catch (err) {
            console.error('load genre animes error', err);
            if (!cancelled) {
              setter([]);
            }
          } finally {
            if (!cancelled) {
              setLoading(false);
            }
          }
        }));
      } catch (err) {
        console.error('load animes error', err);
        if (!cancelled) {
          setLoadingAction(false);
          setLoadingFantasy(false);
          setLoadingRomance(false);
          setLoadingSports(false);
        }
      }
    }
    carregarDades();
    return () => {cancelled = true;};
  }, []);

  const contentClassName = isMobileViewport ? 'home-content content-mobile' : 'home-content';
  const gridClassName = isMobileViewport ? 'anime-grid-inline anime-grid-inline-mobile' : 'anime-grid-inline';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <BarraNavegacio />
      <div className={contentClassName}>
        {loadingRecent ?
        <div className="loading-container">
            <div className="loader"></div>
          </div> :

        <Carrusel items={recentAnimes.map((a) => ({
          imageUrl: a.imatge_portada || '',
          title: a.titol || '---',
          subtitle: a.estat || 'Recomendado',
          episodeCount: a.episodeCount || 0,
          synopsis: a.sinopsi_es || a.sinopsi || '',
          showStar: true,
          id_anime: a.id_anime
        }))} onItemClick={seleccionarAnime} />
        }
        <br />
        <h2>EN EMISION</h2>
        {loadingAiring ?
        <div className="loading-container">
                    <div className="loader"></div>
                  </div> :

        <div className={gridClassName}>
                    {airingAnimes.map((a) =>
          <CobertaAnimeEnLinia
            key={a.id_anime || a.id}
            imageUrl={a.imatge_portada || a.imageUrl || ''}
            title={a.titol || a.title || '---'}
            synopsis={a.sinopsi_es || a.sinopsi || ''}
            episodeCount={a.episodeCount}
            onClick={() => seleccionarAnime(a)} />

          )}
                  </div>
        }
                <br />
        <h2>ACCIÓN</h2>
        {loadingAction ?
        <div className="loading-container">
                    <div className="loader"></div>
                  </div> :

        <div className={gridClassName}>
                    {actionAnimes.map((a) =>
          <CobertaAnimeEnLinia
            key={a.id_anime || a.id}
            imageUrl={a.imatge_portada || a.imageUrl || ''}
            title={a.titol || a.title || '---'}
            synopsis={a.sinopsi_es || a.sinopsi || ''}
            episodeCount={a.episodeCount}
            onClick={() => seleccionarAnime(a)} />

          )}
                  </div>
        }
                <br />
        <h2>ROMANCE</h2>
        {loadingRomance ?
        <div className="loading-container">
                    <div className="loader"></div>
                  </div> :

        <div className={gridClassName}>
                    {romanceAnimes.map((a) =>
          <CobertaAnimeEnLinia
            key={a.id_anime || a.id}
            imageUrl={a.imatge_portada || a.imageUrl || ''}
            title={a.titol || a.title || '---'}
            synopsis={a.sinopsi_es || a.sinopsi || ''}
            episodeCount={a.episodeCount}
            onClick={() => seleccionarAnime(a)} />

          )}
                  </div>
        }
                <br />
        <h2>FANTASÍA</h2>
        {loadingFantasy ?
        <div className="loading-container">
                    <div className="loader"></div>
                  </div> :

        <div className={gridClassName}>
                    {fantasyAnimes.map((a) =>
          <CobertaAnimeEnLinia
            key={a.id_anime || a.id}
            imageUrl={a.imatge_portada || a.imageUrl || ''}
            title={a.titol || a.title || '---'}
            synopsis={a.sinopsi_es || a.sinopsi || ''}
            episodeCount={a.episodeCount}
            onClick={() => seleccionarAnime(a)} />

          )}
                  </div>
        }
                <br />
          <h2>DEPORTES</h2>
          {loadingSports ?
        <div className="loading-container">
                      <div className="loader"></div>
                      </div> :

        <div className={gridClassName}>
                          {SportsAnimes.map((a) =>
          <CobertaAnimeEnLinia
            key={a.id_anime || a.id}
            imageUrl={a.imatge_portada || a.imageUrl || ''}
            title={a.titol || a.title || '---'}
            synopsis={a.sinopsi_es || a.sinopsi || ''}
            episodeCount={a.episodeCount}
            onClick={() => seleccionarAnime(a)} />

          )}
                        </div>
        }
      </div>
      <PeuPagina />
    </div>);

}

export default Inici;

import { Navbar } from '../components/NavBar/NavBar.jsx';
import { Carrusel } from '../components/Carrusel/Carrusel.jsx';
import '../styles/home.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimeCover } from '../components/AnimeCover/AnimeCover.jsx'

function Home() {
  const navigate = useNavigate();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);

  function handleSelect(anime) {
    const id = anime.id_anime || anime.id;
    if (id) {
      navigate(`/details/${id}`);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/anime/genre/action');
        if (!res.ok) throw new Error('failed to fetch');
        const body = await res.json();
        if (!cancelled) {
          const list = body.anime || [];
          console.log('fetched animes', list.map(a=>({id:a.id_anime,episodeCount:a.episodeCount}))); // debug
          setAnimes(list);
        }
      } catch (err) {
        console.error('load animes error', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);
  return (
    <div>
      <Navbar />
      <div className="content">
        <Carrusel items={[
          {
            imageUrl: 'https://myanimelist.net/images/anime/1491/102275.jpg',
            title: 'Chainsaw Man',
            subtitle: 'En emisión',
            episodeCount: 12,
            synopsis: 'Denji fusiona su cuerpo con su perro-demonio para convertirse en el hombre motosierra.',
            showStar: true,
          },
          {
            imageUrl: 'https://myanimelist.net/images/anime/1069/133679.jpg',
            title: "Takopi's Original Sin",
            subtitle: 'En emisión',
            episodeCount: 6,
            synopsis: 'Una historia oscura sobre la inocencia perdida y la amistad entre una criatura alienígena y una niña.',
            showStar: true,
          },
          {
            imageUrl: 'https://myanimelist.net/images/anime/1193/146084.jpg',
            title: 'Fullmetal Alchemist',
            subtitle: 'En emisión',
            episodeCount: 64,
            synopsis: 'Dos hermanos buscan la Piedra Filosofal para recuperar sus cuerpos tras un ritual alquímico fallido.',
            showStar: true,
          },
          {
            imageUrl: 'https://myanimelist.net/images/anime/10/54341.jpg',
            title: 'Cowboy Bebop',
            subtitle: 'Clásico',
            episodeCount: 26,
            synopsis: 'Un grupo de cazarrecompensas viaja por el espacio en busca de los criminales más buscados.',
            showStar: true,
          },
          {
            imageUrl: 'https://myanimelist.net/images/anime/1314/108941.jpg',
            title: 'Evangelion 3.0+1.0',
            subtitle: 'Película',
            episodeCount: 1,
            synopsis: 'La batalla final de Shinji Ikari para salvar a la humanidad y encontrar su lugar en el mundo.',
            showStar: true,
          },
        ]} />
        <h2>ACCIÓN</h2>
        {loading ? (
                  <div className="loading-container">
                    <div className="loader"></div>
                  </div>
                ) : (
                  <div className="anime-grid">
                    {animes.map((a) => (
                      <AnimeCover
                        key={a.id_anime || a.id}
                        imageUrl={a.imatge_portada || a.imageUrl || ''}
                        title={a.titol || a.title || '---'}
                        synopsis={a.sinopsi_es || a.sinopsi || ''}
                        episodeCount={a.episodeCount}
                        showStar={false} /* cambiar según sesión */
                        onClick={() => handleSelect(a)}
                      />
                    ))}
                  </div>
                )}
      </div>
    </div>
  );
}

export default Home;
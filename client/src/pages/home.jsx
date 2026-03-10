import { Navbar } from '../components/NavBar/NavBar.jsx';
import { Carrusel } from '../components/Carrusel/Carrusel.jsx';
import '../styles/home.css';

function Home() {
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
      </div>
    </div>
  );
}

export default Home;
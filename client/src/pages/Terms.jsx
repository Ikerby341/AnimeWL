import { useEffect } from 'react';
import { Navbar } from '../components/NavBar/NavBar.jsx';
import Footer from '../components/Footer/Footer.jsx';
import '../styles/legal.css';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <Navbar profile={false} searchBar={false} favorites={false} directory={false} />
      <main className="legal-wrapper">
        <section className="legal-card">
          <p className="legal-eyebrow">AnimeWL</p>
          <h1 className="legal-title">Terminos y Condiciones</h1>
          <p className="legal-intro">
            AnimeWL es un espacio pensado para descubrir anime, guardar favoritos y seguir series
            de una forma comoda. Al usar la plataforma aceptas hacer un uso responsable del sitio y
            respetar tanto a otros usuarios como al contenido mostrado.
          </p>

          <div className="legal-section">
            <h2>Uso de la plataforma</h2>
            <p>
              Puedes navegar, buscar titulos, consultar fichas y gestionar tu cuenta personal.
              Queda prohibido utilizar AnimeWL para intentar alterar el funcionamiento del servicio,
              acceder sin autorizacion a cuentas ajenas o automatizar acciones que perjudiquen la
              experiencia del resto de usuarios.
            </p>
          </div>

          <div className="legal-section">
            <h2>Cuenta de usuario</h2>
            <p>
              Si te registras, eres responsable de mantener la confidencialidad de tus credenciales
              y de la actividad realizada desde tu cuenta. Nos reservamos la posibilidad de suspender
              perfiles que hagan un uso fraudulento, ofensivo o claramente abusivo del servicio.
            </p>
          </div>

          <div className="legal-section">
            <h2>Contenido e informacion</h2>
            <p>
              Los datos de animes, sinopsis, imagenes y otros metadatos se muestran con fines
              informativos y pueden proceder de fuentes externas. Aunque intentamos mantener la
              informacion actualizada, no garantizamos que todos los datos esten completos, libres de
              errores o disponibles en todo momento.
            </p>
          </div>

          <div className="legal-section">
            <h2>Propiedad intelectual</h2>
            <p>
              Las marcas, nombres, imagenes y materiales relacionados con las obras mostradas
              pertenecen a sus respectivos titulares. AnimeWL no reclama derechos sobre dichas obras
              y solo utiliza los elementos necesarios para identificar y organizar el catalogo dentro
              de la plataforma.
            </p>
          </div>

          <div className="legal-section">
            <h2>Disponibilidad del servicio</h2>
            <p>
              Podemos introducir cambios, mejoras, correcciones o tareas de mantenimiento para mantener
              la plataforma actualizada. En caso de interrupciones puntuales, trabajaremos para restaurar
              el servicio con normalidad.
            </p>
          </div>

          <div className="legal-section">
            <h2>Limitacion de responsabilidad</h2>
            <p>
              AnimeWL se ofrece como una plataforma informativa y de gestion personal. No asumimos
              responsabilidad por interrupciones, perdidas de datos derivadas de terceros, ni por
              decisiones tomadas por el usuario a partir de la informacion publicada en el sitio.
            </p>
          </div>

          <div className="legal-section">
            <h2>Cambios en estos terminos</h2>
            <p>
              Estos terminos pueden actualizarse para reflejar cambios legales, tecnicos o de
              funcionamiento. Cuando ocurra, la version publicada en esta pagina sera la vigente.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

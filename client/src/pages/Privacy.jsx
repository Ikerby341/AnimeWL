import { useEffect } from 'react';
import { Navbar } from '../components/NavBar/NavBar.jsx';
import Footer from '../components/Footer/Footer.jsx';
import '../styles/legal.css';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <Navbar profile={false} searchBar={false} favorites={false} directory={false} />
      <main className="legal-wrapper">
        <section className="legal-card">
          <p className="legal-eyebrow">AnimeWL</p>
          <h1 className="legal-title">Politica de Privacidad</h1>
          <p className="legal-intro">
            En AnimeWL tratamos los datos personales minimos necesarios para que puedas crear tu
            cuenta, iniciar sesion y disfrutar de funciones como favoritos o perfil de usuario.
            Nuestro objetivo es recoger solo la informacion util para que la plataforma funcione bien.
          </p>

          <div className="legal-section">
            <h2>Que datos podemos tratar</h2>
            <p>
              Dependiendo de como uses la web, podemos almacenar datos como nombre de usuario, correo
              electronico, imagen de perfil, preferencias asociadas a tu cuenta y actividad basica
              dentro de la plataforma, por ejemplo los animes que marcas como favoritos.
            </p>
          </div>

          <div className="legal-section">
            <h2>Para que usamos esos datos</h2>
            <p>
              Utilizamos la informacion para autenticarte, personalizar tu experiencia, mostrar tu
              perfil, mejorar el funcionamiento general del servicio y resolver incidencias tecnicas o
              de seguridad cuando sea necesario.
            </p>
          </div>

          <div className="legal-section">
            <h2>Conservacion y seguridad</h2>
            <p>
              Aplicamos medidas razonables para proteger la informacion frente a accesos no
              autorizados, perdida o alteracion. Aun asi, ningun sistema conectado a internet puede
              garantizar una seguridad absoluta, por lo que trabajamos para reducir riesgos de forma
              continua.
            </p>
          </div>

          <div className="legal-section">
            <h2>Datos de terceros</h2>
            <p>
              Algunas fichas, imagenes o resultados de busqueda pueden depender de servicios o fuentes
              externas. En esos casos, el tratamiento de determinada informacion tambien puede estar
              sujeto a las condiciones y politicas de esos proveedores.
            </p>
          </div>

          <div className="legal-section">
            <h2>Tus derechos</h2>
            <p>
              Puedes solicitar la actualizacion o eliminacion de los datos vinculados a tu cuenta
              siempre que sea compatible con las obligaciones tecnicas o legales aplicables. Tambien
              puedes dejar de usar el servicio en cualquier momento.
            </p>
          </div>

          <div className="legal-section">
            <h2>Actualizaciones de esta politica</h2>
            <p>
              Esta politica puede modificarse para adaptarse a nuevas funciones, cambios normativos o
              mejoras internas. La version publicada en esta pagina sera la referencia vigente en cada
              momento.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

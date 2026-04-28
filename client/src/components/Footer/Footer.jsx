import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <h3 className="footer-title">
            <span className="footer-title-white">Anime</span>
            <span className="footer-title-green">WL</span>
          </h3>
          <p className="footer-subtitle">Tu plataforma de anime favorita</p>
        </div>

        <div className="footer-links">
          <Link className="footer-button" to="/terminos-y-condiciones">
            Terminos y Condiciones
          </Link>
          <Link className="footer-button" to="/politica-de-privacidad">
            Politica de Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}

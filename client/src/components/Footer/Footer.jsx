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
          <button className="footer-button">Términos y Condiciones</button>
          <button className="footer-button">Política de Privacidad</button>
        </div>
      </div>
    </footer>
  );
}

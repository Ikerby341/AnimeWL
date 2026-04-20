import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <h1 className="footer-title">AnimeWL</h1>
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

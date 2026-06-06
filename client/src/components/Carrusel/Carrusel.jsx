import './Carrusel.css';
import { useCallback, useEffect, useRef, useState } from "react";
import { TargetaAnimeCarrusel } from '../AnimeCarruselCard/AnimeCarruselCard.jsx';

const MOBILE_BREAKPOINT = 768;

function obtenirAmpladaFinestra() {
  return typeof window !== 'undefined' ? window.innerWidth : MOBILE_BREAKPOINT + 1;
}

export function Carrusel({ items = [], images = [], onItemClick }) {
  const slides = items.length > 0 ?
  items :
  images.map((url) => ({ imageUrl: url }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() => obtenirAmpladaFinestra());
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchHandled = useRef(false);

  const anarSeguent = useCallback(() =>
  setCurrentIndex((prev) => (prev + 1) % slides.length),
  [slides.length]);

  const anarAnterior = useCallback(() =>
  setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length),
  [slides.length]);

  useEffect(() => {
    const gestionarRedimensio = () => setViewportWidth(obtenirAmpladaFinestra());

    gestionarRedimensio();
    window.addEventListener('resize', gestionarRedimensio);
    window.addEventListener('orientationchange', gestionarRedimensio);

    return () => {
      window.removeEventListener('resize', gestionarRedimensio);
      window.removeEventListener('orientationchange', gestionarRedimensio);
    };
  }, []);

  useEffect(() => {
    const gestionarTeclaGlobal = (event) => {
      const target = event.target;
      const tagName = target?.tagName;
      const isTypingTarget =
      target?.isContentEditable ||
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      tagName === 'SELECT';

      if (isTypingTarget || slides.length <= 1) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        anarAnterior();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        anarSeguent();
      }
    };

    window.addEventListener('keydown', gestionarTeclaGlobal);
    return () => window.removeEventListener('keydown', gestionarTeclaGlobal);
  }, [anarSeguent, anarAnterior, slides.length]);

  const gestionarClicPunt = (index) => setCurrentIndex(index);

  const gestionarIniciTactil = (event) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchHandled.current = false;
  };

  const gestionarMovimentTactil = (event) => {
    if (touchStartX.current === null || touchStartY.current === null || touchHandled.current) {
      return;
    }

    const touch = event.touches[0];
    const diffX = touch.clientX - touchStartX.current;
    const diffY = touch.clientY - touchStartY.current;
    const isHorizontalSwipe = Math.abs(diffX) > 48 && Math.abs(diffX) > Math.abs(diffY) * 1.3;

    if (!isHorizontalSwipe) {
      return;
    }

    if (diffX < 0) {
      anarSeguent();
    } else {
      anarAnterior();
    }

    touchHandled.current = true;
  };

  const gestionarFiTactil = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    touchHandled.current = false;
  };

  const SIDE_COUNT = 2;

  const getOffset = (idx) => {
    let offset = idx - currentIndex;
    if (offset > slides.length / 2) offset -= slides.length;
    if (offset < -slides.length / 2) offset += slides.length;
    return offset;
  };

  const isVisible = (offset) => Math.abs(offset) <= SIDE_COUNT;

  return (
    <div
      className="coverflow-carousel"
      onTouchStart={gestionarIniciTactil}
      onTouchMove={gestionarMovimentTactil}
      onTouchEnd={gestionarFiTactil}
      onTouchCancel={gestionarFiTactil}>
      
      <button className="coverflow-arrow coverflow-arrow--left" onClick={anarAnterior} aria-label="Anterior">
        <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 96 960 960" width="28" fill="currentColor" style={{ transform: 'scaleX(-1)' }}>
          <path d="m304 974-56-57 343-343-343-343 56-57 400 400-400 400Z" />
        </svg>
      </button>

      <div className="coverflow-track">
        {slides.map((slide, idx) => {
          const offset = getOffset(idx);
          if (!isVisible(offset)) return null;

          return (
            <div
              key={idx}
              className="coverflow-item"
              style={obtenirEstilElement(offset, viewportWidth)}
              onClick={() => {
                if (offset !== 0) setCurrentIndex(idx);
                if (onItemClick) onItemClick(slide);
              }}>
              
              <TargetaAnimeCarrusel
                imageUrl={slide.imageUrl}
                title={slide.title || ''}
                subtitle={slide.subtitle || ''}
                synopsis={slide.synopsis || ''}
                episodeCount={slide.episodeCount || null}
                showTitle={offset === 0}
                altText={slide.title || ''}
                onClick={onItemClick ? () => onItemClick(slide) : undefined} />
              
            </div>);

        })}
      </div>

      <button className="coverflow-arrow coverflow-arrow--right" onClick={anarSeguent} aria-label="Siguiente">
        <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 96 960 960" width="28" fill="currentColor">
          <path d="m304 974-56-57 343-343-343-343 56-57 400 400-400 400Z" />
        </svg>
      </button>

      <div className="coverflow-dots">
        {slides.map((_, index) =>
        <button
          key={index}
          className={`coverflow-dot${currentIndex === index ? ' coverflow-dot--active' : ''}`}
          onClick={() => gestionarClicPunt(index)}
          aria-label={`Ir a slide ${index + 1}`} />

        )}
      </div>
    </div>);

}

function obtenirEstilElement(offset, viewportWidth) {
  const isMobile = viewportWidth <= MOBILE_BREAKPOINT;
  const configs = isMobile ? {
    '-2': { translateX: -210, scale: 0.58, rotateY: 28, opacity: 0.35, brightness: 0.45, zIndex: 1 },
    '-1': { translateX: -118, scale: 0.76, rotateY: 18, opacity: 0.72, brightness: 0.65, zIndex: 2 },
    '0': { translateX: 0, scale: 1.00, rotateY: 0, opacity: 1.00, brightness: 1.00, zIndex: 5 },
    '1': { translateX: 118, scale: 0.76, rotateY: -18, opacity: 0.72, brightness: 0.65, zIndex: 2 },
    '2': { translateX: 210, scale: 0.58, rotateY: -28, opacity: 0.35, brightness: 0.45, zIndex: 1 }
  } : {
    '-2': { translateX: -400, scale: 0.65, rotateY: 35, opacity: 0.45, brightness: 0.45, zIndex: 1 },
    '-1': { translateX: -220, scale: 0.82, rotateY: 22, opacity: 0.75, brightness: 0.65, zIndex: 2 },
    '0': { translateX: 0, scale: 1.00, rotateY: 0, opacity: 1.00, brightness: 1.00, zIndex: 5 },
    '1': { translateX: 220, scale: 0.82, rotateY: -22, opacity: 0.75, brightness: 0.65, zIndex: 2 },
    '2': { translateX: 400, scale: 0.65, rotateY: -35, opacity: 0.45, brightness: 0.45, zIndex: 1 }
  };

  const c = configs[String(offset)];
  if (!c) return { display: 'none' };

  return {
    position: 'absolute',
    zIndex: c.zIndex,
    opacity: c.opacity,
    cursor: offset === 0 ? 'default' : 'pointer',
    transform: `translateX(${c.translateX}px) scale(${c.scale}) rotateY(${c.rotateY}deg)`,
    filter: `brightness(${c.brightness})`,
    transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease, filter 0.5s ease',
    transformStyle: 'preserve-3d'
  };
}
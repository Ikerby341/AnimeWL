import './Carrusel.css';
import { useState } from "react";
import { AnimeCarruselCard } from '../AnimeCarruselCard/AnimeCarruselCard.jsx';

export function Carrusel({ items = [], images = [] }) {
  const slides = items.length > 0
    ? items
    : images.map((url) => ({ imageUrl: url }));

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () =>
    setCurrentIndex((prev) => (prev + 1) % slides.length);

  const handlePrevious = () =>
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const handleDotClick = (index) => setCurrentIndex(index);

  const SIDE_COUNT = 2;

  // Calculates the offset (-2 to +2) of each slide relative to current center
  const getOffset = (idx) => {
    let offset = idx - currentIndex;
    // Wrap around for circular behavior
    if (offset > slides.length / 2)  offset -= slides.length;
    if (offset < -slides.length / 2) offset += slides.length;
    return offset;
  };

  const isVisible = (offset) => Math.abs(offset) <= SIDE_COUNT;

  return (
    <div className="coverflow-carousel">
      <button className="coverflow-arrow coverflow-arrow--left" onClick={handlePrevious} aria-label="Anterior">
        <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 96 960 960" width="28" fill="currentColor">
          <path d="M400 976 0 576l400-400 56 57-343 343 343 343-56 57Z" />
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
              style={getItemStyle(offset)}
              onClick={() => {
                if (offset !== 0) setCurrentIndex(idx);
              }}
            >
              <AnimeCarruselCard
                imageUrl={slide.imageUrl}
                title={slide.title || ''}
                subtitle={slide.subtitle || ''}
                synopsis={slide.synopsis || ''}
                episodeCount={slide.episodeCount || null}
                showTitle={offset === 0}
                altText={slide.title || 'Anime cover'}
              />
            </div>
          );
        })}
      </div>

      <button className="coverflow-arrow coverflow-arrow--right" onClick={handleNext} aria-label="Siguiente">
        <svg xmlns="http://www.w3.org/2000/svg" height="28" viewBox="0 96 960 960" width="28" fill="currentColor">
          <path d="m304 974-56-57 343-343-343-343 56-57 400 400-400 400Z" />
        </svg>
      </button>

      <div className="coverflow-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`coverflow-dot${currentIndex === index ? ' coverflow-dot--active' : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Inline styles per offset so the transition animates smoothly between states
function getItemStyle(offset) {
  const configs = {
    '-2': { translateX: -400, scale: 0.65, rotateY: 35,  opacity: 0.45, brightness: 0.45, zIndex: 1 },
    '-1': { translateX: -220, scale: 0.82, rotateY: 22,  opacity: 0.75, brightness: 0.65, zIndex: 2 },
     '0': { translateX:    0, scale: 1.00, rotateY: 0,   opacity: 1.00, brightness: 1.00, zIndex: 5 },
     '1': { translateX:  220, scale: 0.82, rotateY: -22, opacity: 0.75, brightness: 0.65, zIndex: 2 },
     '2': { translateX:  400, scale: 0.65, rotateY: -35, opacity: 0.45, brightness: 0.45, zIndex: 1 },
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
    // This is the key: transition on transform/opacity/filter, not on a CSS class swap
    transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease, filter 0.5s ease',
    transformStyle: 'preserve-3d',
  };
}
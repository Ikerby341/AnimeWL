function formatarMinuts(minutes) {
  if (minutes == null) return '0 min';
  return `${minutes.toLocaleString('es-ES')} min`;
}export { formatarMinuts };

function formatarHores(minutes) {
  if (minutes == null) return '0h';
  const hours = minutes / 60;
  return `${hours.toFixed(1).replace('.0', '')}h`;
}export { formatarHores };

function formatarValor(value) {
  return value != null ? value.toLocaleString('es-ES') : '0';
}export { formatarValor };

function construirSegmentsPastis(topGenres = [], pieColors = []) {
  const totalGenreValue = topGenres.reduce((sum, item) => sum + (item.value || 0), 0);

  return topGenres.map((item, index) => ({
    color: pieColors[index % pieColors.length],
    percentage: totalGenreValue ? item.value / totalGenreValue * 100 : 0
  }));
}export { construirSegmentsPastis };

function construirFonsPastis(pieSegments = []) {
  if (!pieSegments.length) {
    return 'conic-gradient(#db2f46 0deg 90deg, #ff7684 90deg 160deg, #ff9b9b 160deg 240deg, #d92b42 240deg 360deg)';
  }

  return `conic-gradient(${pieSegments.
  map((segment, idx) => {
    const start = pieSegments.slice(0, idx).reduce((sum, seg) => sum + seg.percentage, 0);
    const end = start + segment.percentage;
    return `${segment.color} ${start}% ${end}%`;
  }).
  join(', ')})`;
}export { construirFonsPastis };

function calcularAlcadaBarra(minutes = 0, maxMinutes = 1, minBarRatio = 0.02) {
  if (!minutes || minutes <= 0) {
    return '0%';
  }

  return `${Math.max(minutes / maxMinutes, minBarRatio) * 100}%`;
}export { calcularAlcadaBarra };
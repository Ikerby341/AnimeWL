import { useState, useEffect } from 'react';
import './Estadisticas.css';
import { buildPieBackground, buildPieSegments, calculateBarHeight, formatHours, formatMinutes, formatValue } from './statsHelpers.js';

export function Estadisticas() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/stats`, {
                    credentials: 'include'
                });

                const text = await response.text();
                let data;

                try {
                    data = JSON.parse(text);
                } catch (e) {
                    throw new Error(`Unexpected response from API: ${text.slice(0, 200)}`);
                }

                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'No se pudieron cargar las estadísticas.');
                }
                setStats(data.stats);
            } catch (err) {
                console.error('Error fetching user stats:', err);
                setError(err.message || 'Error al cargar estadísticas.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const chartBars = stats?.topAnimes || [];
    const maxMinutes = chartBars.length ? Math.max(...chartBars.map((item) => item.minutes || 0), 1) : 1;
    const minBarRatio = 0.02;
    const topGenres = stats?.topGenres || [];
    const pieColors = ['#db2f46', '#ff7684', '#14b8a6'];
    const pieSegments = buildPieSegments(topGenres, pieColors);
    const pieBackground = buildPieBackground(pieSegments);

    return (
        <div className="estadisticas-page">
            {loading ? (
                <div className="stats-loading">Cargando estadísticas...</div>
            ) : error ? (
                <div className="stats-error">{error}</div>
            ) : (
                <>
                    <div className="stats-charts">
                        <div className="stats-card stats-pie-card">
                            <div className="stats-card-header">
                                <h3>Género más visto</h3>
                            </div>
                            <div className="stats-pie" style={{ background: pieBackground }}>
                                <div className="stats-pie-center">
                                    <span>{stats?.topGenre || 'Sin datos'}</span>
                                </div>
                            </div>
                            <div className="stats-pie-legend">
                                {topGenres.length > 0 ? (
                                    topGenres.map((item, index) => (
                                        <div className="stats-legend-item" key={item.genre}>
                                            <span
                                                className="stats-legend-color"
                                                style={{ backgroundColor: pieColors[index % pieColors.length] }}
                                            />
                                            <span className="stats-legend-label">{item.genre}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="stats-legend-empty">Sin datos de géneros.</div>
                                )}
                            </div>
                            <p className="stats-card-note">Basado en el progreso registrado por anime.</p>
                        </div>
                        <div className="stats-card stats-bar-card">
                            <div className="stats-card-header">
                                <h3>Horas x Anime</h3>
                            </div>
                            <div className="stats-bar-graph">
                                {chartBars.length > 0 ? (
                                    chartBars.map((item, index) => (
                                        <div className="stats-bar-item" key={index}>
                                            <div className="stats-bar-column">
                                                <div
                                                    className="stats-bar-fill"
                                                    style={{
                                                        height: calculateBarHeight(item.minutes || 0, maxMinutes, minBarRatio)
                                                    }}
                                                />
                                                <span className="stats-bar-value">{formatHours(item.minutes)}</span>
                                            </div>
                                            <div className="stats-bar-label-wrapper">
                                                <span className="stats-bar-label">{item.title}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="stats-bar-empty">No hay datos suficientes para mostrar el gráfico.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="stats-divider" />

                    <div className="stats-metrics">
                        <div className="stats-metric-card">
                            <span className="stats-metric-label">Minutos de visualización</span>
                            <span className="stats-metric-value">{formatMinutes(stats?.totalMinutes)}</span>
                        </div>
                        <div className="stats-metric-card">
                            <span className="stats-metric-label">Animes finalizados</span>
                            <span className="stats-metric-value">{formatValue(stats?.totalFinishedAnimes)}</span>
                        </div>
                        <div className="stats-metric-card">
                            <span className="stats-metric-label">Capítulos vistos</span>
                            <span className="stats-metric-value">{formatValue(stats?.totalChapters)}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

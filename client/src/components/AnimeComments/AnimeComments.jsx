import './AnimeComments.css';
import userIcon from '../../assets/usuari.png';

export function AnimeComments({ comments, loading }) {
    const formattedComments = comments || [];

    return (
        <section className="anime-comments-section">
            <div className="comments-header">
                <h2>Comentarios</h2>
                <span>{loading ? 'Cargando...' : `${formattedComments.length} comentario${formattedComments.length === 1 ? '' : 's'}`}</span>
            </div>
            {loading && <p className="comments-loading">Cargando comentarios...</p>}
            {!loading && formattedComments.length === 0 && (
                <div className="comments-empty">Aún no hay comentarios para este anime.</div>
            )}
            <div className="comments-list">
                {formattedComments.map((comment) => {
                    const avatarSrc = comment.userImg || userIcon;
                    return (
                        <article key={comment.id_comentari} className="comment-card">
                            <div className="comment-card-top">
                                <div className="comment-user-info">
                                    <img
                                        className="comment-avatar"
                                        src={avatarSrc}
                                        alt={comment.userName}
                                    />
                                    <div>
                                        <p className="comment-user">{comment.userName}</p>
                                        <p className="comment-meta">{comment.id_capitol ? `Capítulo ${comment.id_capitol}` : 'General'}</p>
                                    </div>
                                </div>
                                <p className="comment-date">
                                    {comment.data_hora ? new Date(comment.data_hora).toLocaleString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : ''}
                                </p>
                            </div>
                            <p className="comment-text">{comment.contingut}</p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

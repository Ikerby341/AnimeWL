import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AnimeComments.css';
import userIcon from '../../assets/usuari.webp';

function getCommentUserId(comment) {
    return comment.id_usuari
        || comment.id_usuario
        || comment.id_user
        || comment.userId
        || comment.user_id
        || comment.user?.id_usuari
        || comment.user?.id
        || null;
}

function formatCommentDate(value) {
    if (!value) return '';
    const textValue = String(value);
    const hasTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(textValue);
    const date = new Date(hasTimeZone ? textValue : `${textValue}Z`);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function AnimeComments({ animeId, comments, loading, isLoggedIn, currentUserId, onCommentAdded, onCommentDeleted }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    const formattedComments = comments || [];

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError('');
        const trimmedText = commentText.trim();
        if (!trimmedText) {
            setSubmitError('El comentario no puede estar vacío.');
            return;
        }
        setSubmitLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/${animeId}/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contingut: trimmedText })
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                setSubmitError(data.error || 'Error al enviar el comentario.');
                return;
            }
            if (onCommentAdded) {
                onCommentAdded(data.comment);
            }
            setCommentText('');
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error submitting comment:', error);
            setSubmitError('Error al enviar el comentario. Intenta de nuevo.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!commentId) return;
        setDeleteError('');
        setDeletingCommentId(commentId);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/anime/${animeId}/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json') ? await response.json() : {};
            if (!response.ok || !data.success) {
                setDeleteError(data.error || 'Error al borrar el comentario.');
                return;
            }
            if (onCommentDeleted) {
                onCommentDeleted(commentId);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            setDeleteError('Error al borrar el comentario. Intenta de nuevo.');
        } finally {
            setDeletingCommentId(null);
        }
    };

    return (
        <section className="anime-comments-section">
            <div className="comments-header">
                <h2>Comentarios</h2>
                <span>{loading ? 'Cargando...' : `${formattedComments.length} comentario${formattedComments.length === 1 ? '' : 's'}`}</span>
            </div>
            {isLoggedIn && (
                <div className="comment-create-block">
                    {!isFormOpen ? (
                        <button type="button" className="comment-add-button" onClick={() => setIsFormOpen(true)}>
                            Añadir comentario
                        </button>
                    ) : (
                        <form className="comment-form" onSubmit={handleSubmit}>
                            <textarea
                                className="comment-textarea"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Escribe tu comentario..."
                                rows={4}
                            />
                            {submitError && <div className="comment-form-error">{submitError}</div>}
                            <div className="comment-form-actions">
                                <button type="submit" className="comment-submit-button" disabled={submitLoading}>
                                    {submitLoading ? 'Enviando...' : 'Enviar comentario'}
                                </button>
                                <button type="button" className="comment-cancel-button" onClick={() => { setIsFormOpen(false); setCommentText(''); setSubmitError(''); }}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
            {loading && <p className="comments-loading">Cargando comentarios...</p>}
            {!loading && formattedComments.length === 0 && (
                <div className="comments-empty">Aún no hay comentarios para este anime.</div>
            )}
            {deleteError && <div className="comment-form-error comment-delete-error">{deleteError}</div>}
            <div className="comments-list">
                {formattedComments.map((comment) => {
                    const avatarSrc = comment.userImg || userIcon;
                    const commentUserId = getCommentUserId(comment);
                    const isOwnComment = currentUserId && commentUserId && String(commentUserId) === String(currentUserId);
                    const userContent = (
                        <>
                            <img
                                className="comment-avatar"
                                src={avatarSrc}
                                alt={comment.userName}
                            />
                            <div>
                                <p className="comment-user">{comment.userName}</p>
                                <p className="comment-meta">{comment.id_capitol ? `Capítulo ${comment.id_capitol}` : 'General'}</p>
                            </div>
                        </>
                    );

                    return (
                        <article key={comment.id_comentari} className="comment-card">
                            <div className="comment-card-top">
                                {commentUserId ? (
                                    <Link className="comment-user-info comment-user-link" to={`/profile/${commentUserId}`}>
                                        {userContent}
                                    </Link>
                                ) : (
                                    <div className="comment-user-info">
                                        {userContent}
                                    </div>
                                )}
                                <p className="comment-date">{formatCommentDate(comment.data_hora)}</p>
                            </div>
                            <p className="comment-text">{comment.contingut}</p>
                            {isOwnComment && (
                                <div className="comment-delete-row">
                                    <button
                                        type="button"
                                        className="comment-delete-button"
                                        onClick={() => handleDelete(comment.id_comentari)}
                                        disabled={deletingCommentId === comment.id_comentari}
                                    >
                                        {deletingCommentId === comment.id_comentari ? 'Borrando...' : 'Borrar comentario'}
                                    </button>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BarraNavegacio } from '../components/NavBar/NavBar.jsx';
import PeuPagina from '../components/Footer/Footer.jsx';
import { useAutenticacio } from '../hooks/useAuth.js';
import '../styles/adminUsers.css';

function GestioUsuaris() {
  const { user, loading, checkSession } = useAutenticacio();
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [savingUserId, setSavingUserId] = useState(null);

  const isAdmin = user?.isAdmin === true;

  useEffect(() => {
    if (!isAdmin) {
      setLoadingUsers(false);
      return;
    }

    let cancelled = false;

    async function carregarUsuaris() {
      setLoadingUsers(true);
      setError('');
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/admin/users`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || 'No se pudieron cargar los usuarios.');
          return;
        }

        if (!cancelled) {
          const userList = data.users || [];
          setUsers(userList);
          setDrafts(Object.fromEntries(userList.map((item) => [
          item.id_usuari,
          {
            nom: item.nom || '',
            isAdmin: item.isAdmin === true
          }]
          )));
        }
      } catch (err) {
        console.error('load admin users error', err);
        if (!cancelled) setError('No se pudieron cargar los usuarios.');
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    }

    carregarUsuaris();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const hasChangesByUser = useMemo(() => {
    return Object.fromEntries(users.map((item) => {
      const draft = drafts[item.id_usuari] || {};
      return [
      item.id_usuari,
      (draft.nom ?? '') !== (item.nom ?? '') || Boolean(draft.isAdmin) !== Boolean(item.isAdmin)];

    }));
  }, [drafts, users]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <BarraNavegacio />
        <div className="admin-users-page">
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        </div>
        <PeuPagina />
      </div>);

  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  function actualitzarEsborrany(userId, field, value) {
    setDrafts((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        [field]: value
      }
    }));
  }

  async function desarUsuari(item) {
    const draft = drafts[item.id_usuari];
    if (!draft || !hasChangesByUser[item.id_usuari]) return;

    const trimmedUsername = draft.nom.trim();
    if (!trimmedUsername) {
      setError('El nombre de usuario no puede estar vacío.');
      return;
    }

    setSavingUserId(item.id_usuari);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/admin/users/${item.id_usuari}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nom: trimmedUsername,
          isAdmin: draft.isAdmin === true
        })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'No se pudo actualizar el usuario.');
        return;
      }

      setUsers((current) => current.map((userItem) =>
      userItem.id_usuari === item.id_usuari ?
      { ...userItem, ...data.user } :
      userItem
      ));
      setDrafts((current) => ({
        ...current,
        [item.id_usuari]: {
          nom: data.user.nom,
          isAdmin: data.user.isAdmin === true
        }
      }));
      if (String(data.user.id_usuari) === String(user?.id_usuari || user?.id)) {
        await checkSession();
      }
      setMessage(data.warning || 'Usuario actualizado correctamente.');
    } catch (err) {
      console.error('save admin user error', err);
      setError('No se pudo actualizar el usuario.');
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <BarraNavegacio />
      <main className="admin-users-page">
        <header className="admin-users-header">
          <h1>Gestión de usuarios</h1>
          <p>Administra nombres de usuario y roles. El correo se muestra solo como referencia.</p>
        </header>

        {error && <div className="admin-users-alert admin-users-alert-error">{error}</div>}
        {message && <div className="admin-users-alert admin-users-alert-success">{message}</div>}

        {loadingUsers ?
        <div className="loading-container">
            <div className="loader"></div>
          </div> :

        <div className="admin-users-table-wrap">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => {
                const draft = drafts[item.id_usuari] || { nom: item.nom || '', isAdmin: item.isAdmin === true };
                const isSaving = savingUserId === item.id_usuari;
                const hasChanges = hasChangesByUser[item.id_usuari];

                return (
                  <tr key={item.id_usuari}>
                      <td>
                        <input
                        className="admin-users-input"
                        value={draft.nom}
                        maxLength={30}
                        onChange={(event) => actualitzarEsborrany(item.id_usuari, 'nom', event.target.value)} />
                      
                      </td>
                      <td>
                        <input
                        className="admin-users-input admin-users-input-readonly"
                        value={item.email || ''}
                        readOnly />
                      
                      </td>
                      <td>
                        <select
                        className="admin-users-select"
                        value={draft.isAdmin ? 'admin' : 'user'}
                        onChange={(event) => actualitzarEsborrany(item.id_usuari, 'isAdmin', event.target.value === 'admin')}>
                        
                          <option value="user">Usuario normal</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                      <td>
                        <button
                        type="button"
                        className="admin-users-save-button"
                        disabled={!hasChanges || isSaving}
                        onClick={() => desarUsuari(item)}>
                        
                          {isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </main>
      <PeuPagina />
    </div>);

}export { GestioUsuaris as default };
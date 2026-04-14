import "./Configuracion.css";
import { useUserInfo } from './../../hooks/useAuth';

export function Configuracion() {
    let userInfo = useUserInfo();
    
    function changeUsername() {
        const newUsername = document.getElementById('username').value;
        if (newUsername.trim() == userInfo.nom) {
            return;
        } else if (newUsername.trim() === '') {
            alert('El nombre de usuario no puede estar vacío');
            return;
        }
        fetch(`/api/user/update-username?newUsername=${encodeURIComponent(newUsername)}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(async response => {
                if (response.ok) {
                    acualitzarDadesUsuari();
                    window.location.reload();
                    return;
                }

                let errorMessage = 'Error al actualizar el nombre de usuario';
                try {
                    const data = await response.json();
                    if (data && data.error) {
                        errorMessage += ': ' + data.error;
                    } else {
                        errorMessage += ': ' + response.statusText;
                    }
                } catch (err) {
                    console.error('Error parsing error response:', err);
                    errorMessage += ': ' + response.statusText;
                }
                alert(errorMessage);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al actualizar el nombre de usuario: ' + error.message);
            });
    }

    function changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Rellena todos los campos de contraseña.');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('La nueva contraseña y la confirmación no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            alert('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        fetch('/api/user/update-password', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword
            })
        })
            .then(async response => {
                if (response.ok) {
                    alert('Contraseña actualizada correctamente.');
                    document.getElementById('current-password').value = '';
                    document.getElementById('password').value = '';
                    document.getElementById('confirm-password').value = '';
                    return;
                }

                let errorMessage = 'Error al actualizar la contraseña';
                try {
                    const data = await response.json();
                    if (data && data.error) {
                        errorMessage += ': ' + data.error;
                    } else {
                        errorMessage += ': ' + response.statusText;
                    }
                } catch (err) {
                    console.error('Error parsing error response:', err);
                    errorMessage += ': ' + response.statusText;
                }
                alert(errorMessage);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al actualizar la contraseña: ' + error.message);
            });
    }

    function acualitzarDadesUsuari() {
        fetch('/api/check-session', {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    userInfo = data.user;
                } else {
                    userInfo = null;
                }
            })
            .catch(error => {
                console.error('Error checking session:', error);
                userInfo = null;
            });
    }

    return (
        <div className="configuracion">
            <label htmlFor="username">Nombre de usuario:</label>
            <input className="password-input" type="text" id="username" name="username" placeholder="Tu nombre de usuario" defaultValue={userInfo.nom} />
            <button className="save-button" onClick={changeUsername}>✏️</button>
            <label htmlFor="email">Correo electrónico:</label>
            <input className="password-input" type="email" id="email" name="email" placeholder="Tu correo electrónico" defaultValue={userInfo.email} />
            <button className="save-button">✏️</button>
            <label htmlFor="password">Cambiar contraseña:</label>
            <input className="password-input" type="password" id="current-password" name="current-password" placeholder="Contraseña actual" style={{ marginTop: '10px' }} />
            <input className="password-input" type="password" id="password" name="password" placeholder="Nueva contraseña" />
            <input className="password-input" type="password" id="confirm-password" name="confirm-password" placeholder="Confirmar nueva contraseña" />
            <button className="change-button" onClick={changePassword}>Cambiar contraseña</button>
        </div>
    );
}

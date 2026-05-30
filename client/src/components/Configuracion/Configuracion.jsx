import { useState } from 'react';
import "./Configuracion.css";
import { useUserInfo } from './../../hooks/useAuth';
import { useToast } from '../../hooks/useToast.js';
import { PencilIcon } from '../Icons/Icons.jsx';

export function Configuracion() {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [isSendCodeDisabled, setIsSendCodeDisabled] = useState(false);
    const { showToast } = useToast();
    let userInfo = useUserInfo();

    function changeUsername() {
        const newUsername = document.getElementById('username').value;
        if (newUsername.trim() == userInfo.nom) {
            return;
        } else if (newUsername.trim() === '') {
            showToast('El nombre de usuario no puede estar vacío', { type: 'error' });
            return;
        }
        fetch(`${import.meta.env.VITE_BACKENDURL}/api/settings/update-username`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newUsername })
        })
            .then(async response => {
                if (response.ok) {
                    acualitzarDadesUsuari();
                    showToast('Nombre de usuario actualizado correctamente.', { type: 'success' });
                    window.setTimeout(() => window.location.reload(), 900);
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
                showToast(errorMessage, { type: 'error' });
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error al actualizar el nombre de usuario: ' + error.message, { type: 'error' });
            });
    }

    function sendEmailVerificationCode() {
        if (isSendCodeDisabled) {
            return;
        }
        setIsSendCodeDisabled(true);
        setTimeout(() => {
            setIsSendCodeDisabled(false);
        }, 60000); // Rehabilitar el botón después de 60 segundos

        fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/send-email-code`, {
            method: 'POST',
            credentials: 'include'
        })
            .then(async response => {
                if (response.ok) {
                    showToast('Código enviado al correo actual. Comprueba tu bandeja de entrada.', { type: 'success' });
                    return;
                }

                let errorMessage = 'Error al enviar el código de verificación.';
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
                showToast(errorMessage, { type: 'error' });
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error al enviar el código de verificación: ' + error.message, { type: 'error' });
            });
    }

    function changeEmail() {
        if (!newEmail || !emailCode) {
            showToast('Rellena el nuevo correo y el código de verificación.', { type: 'error' });
            return;
        }

        fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/update-email`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: emailCode,
                newEmail
            })
        })
            .then(async response => {
                if (response.ok) {
                    showToast('Correo electrónico actualizado correctamente.', { type: 'success' });
                    acualitzarDadesUsuari();
                    setShowEmailModal(false);
                    setNewEmail('');
                    setEmailCode('');
                    window.setTimeout(() => window.location.reload(), 900);
                    return;
                }

                let errorMessage = 'Error al actualizar el correo electrónico';
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
                showToast(errorMessage, { type: 'error' });
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error al actualizar el correo electrónico: ' + error.message, { type: 'error' });
            });
    }

    function changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('Rellena todos los campos de contraseña.', { type: 'error' });
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('La nueva contraseña y la confirmación no coinciden.', { type: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            showToast('La nueva contraseña debe tener al menos 6 caracteres.', { type: 'error' });
            return;
        }

        fetch(`${import.meta.env.VITE_BACKENDURL}/api/user/update-password`, {
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
                    showToast('Contraseña actualizada correctamente.', { type: 'success' });
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
                showToast(errorMessage, { type: 'error' });
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error al actualizar la contraseña: ' + error.message, { type: 'error' });
            });
    }

    function acualitzarDadesUsuari() {
        fetch(`${import.meta.env.VITE_BACKENDURL}/api/check-session`, {
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
            <br />
            <input className="password-input" type="text" id="username" name="username" placeholder="Tu nombre de usuario" defaultValue={userInfo.nom} maxLength={30} />
            <button className="save-button" onClick={changeUsername} aria-label="Editar nombre de usuario" title="Editar nombre de usuario">
                <PencilIcon />
            </button>
            <br />
            <label htmlFor="current-email">Correo electrónico actual:</label>
            <br />
            <input
                className="password-input"
                type="email"
                id="current-email"
                name="current-email"
                placeholder="Correo actual"
                defaultValue={userInfo.email}
                readOnly
            />
            <button className="save-button" onClick={() => setShowEmailModal(true)} aria-label="Editar correo electrónico" title="Editar correo electrónico">
                <PencilIcon />
            </button>


            {showEmailModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setShowEmailModal(false)}>x</button>
                        <h2>Cambiar correo electrónico</h2>
                        <label htmlFor="new-email-modal">Nuevo correo electrónico:</label>
                        <br />
                        <input
                            className="password-input"
                            type="email"
                            id="new-email-modal"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            placeholder="Nuevo correo electrónico"
                        />
                        <br />
                        <label htmlFor="email-code-modal">Código de verificación:</label>
                        <br />
                        <input
                            className="password-input"
                            type="text"
                            id="email-code-modal"
                            value={emailCode}
                            onChange={e => setEmailCode(e.target.value)}
                            placeholder="Código de verificación"
                        />
                        <button
                            className="change-button configuracion-email-send-button"
                            onClick={sendEmailVerificationCode}
                            disabled={isSendCodeDisabled}
                        >
                            {isSendCodeDisabled ? 'Puedes solicitar otro código en 60s' : 'Enviar código al correo actual'}
                        </button>
                        <div className="modal-actions">
                            <button className="change-button" onClick={changeEmail}>Cambiar correo</button>
                        </div>
                    </div>
                </div>
            )}
            <br />
            <label htmlFor="password">Cambiar contraseña:</label>
            <br />
            <input className="password-input" type="password" id="current-password" name="current-password" placeholder="Contraseña actual" style={{ marginTop: '10px' }} />
            <br />
            <input className="password-input" type="password" id="password" name="password" placeholder="Nueva contraseña" />
            <br />
            <input className="password-input" type="password" id="confirm-password" name="confirm-password" placeholder="Confirmar contraseña" />
            <br />
            <button className="change-button" onClick={changePassword}>Cambiar contraseña</button>
        </div>
    );
}



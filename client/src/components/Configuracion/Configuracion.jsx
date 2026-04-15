import { useState } from 'react';
import "./Configuracion.css";
import { useUserInfo } from './../../hooks/useAuth';

export function Configuracion() {
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [isSendCodeDisabled, setIsSendCodeDisabled] = useState(false);
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

    function sendEmailVerificationCode() {
        if (isSendCodeDisabled) {
            return;
        }
        setIsSendCodeDisabled(true);
        setTimeout(() => {
            setIsSendCodeDisabled(false);
        }, 60000); // Rehabilitar el botón después de 60 segundos

        fetch('/api/user/send-email-code', {
            method: 'POST',
            credentials: 'include'
        })
            .then(async response => {
                if (response.ok) {
                    alert('Código enviado al correo actual. Comprueba tu bandeja de entrada.');
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
                alert(errorMessage);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al enviar el código de verificación: ' + error.message);
            });
    }

    function changeEmail() {
        if (!newEmail || !emailCode) {
            alert('Rellena el nuevo correo y el código de verificación.');
            return;
        }

        fetch('/api/user/update-email', {
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
                    alert('Correo electrónico actualizado correctamente.');
                    acualitzarDadesUsuari();
                    setShowEmailModal(false);
                    setNewEmail('');
                    setEmailCode('');
                    window.location.reload();
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
                alert(errorMessage);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al actualizar el correo electrónico: ' + error.message);
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
            <br />
            <input className="password-input" type="text" id="username" name="username" placeholder="Tu nombre de usuario" defaultValue={userInfo.nom} />
            <button className="save-button" onClick={changeUsername}>✏️</button>
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
            <button className="save-button" onClick={() => setShowEmailModal(true)}>✏️</button>


            {showEmailModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setShowEmailModal(false)}>×</button>
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
                            className="save-button configuracion-email-send-button"
                            onClick={sendEmailVerificationCode}
                            disabled={isSendCodeDisabled}
                        >
                            {isSendCodeDisabled ? 'Puedes solicitar otro código en 60s' : 'Enviar código al correo actual'}
                        </button>
                        <div className="modal-actions">
                            <button className="save-button" onClick={changeEmail}>Cambiar correo</button>
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

import "./Configuracion.css";
import { useUserInfo } from './../../hooks/useAuth';

export function Configuracion() {
    const { nom, email } = useUserInfo();

    return (
        <div className="configuracion">
            <label htmlFor="username">Nombre de usuario:</label>
            <input type="text" id="username" name="username" placeholder="Tu nombre de usuario" defaultValue={nom} />
            <button className="save-button">✏️</button>
            <label htmlFor="email">Correo electrónico:</label>
            <input type="email" id="email" name="email" placeholder="Tu correo electrónico" defaultValue={email} />
            <button className="save-button">✏️</button>
            <label htmlFor="password">Cambiar contraseña:</label>
            <input type="password" id="current-password" name="current-password" placeholder="Contraseña actual" style={{ marginTop: '10px' }} />
            <input type="password" id="password" name="password" placeholder="Nueva contraseña" />
            <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirmar nueva contraseña" />
            <button className="change-button">Cambiar contraseña</button>
        </div>
    );
}

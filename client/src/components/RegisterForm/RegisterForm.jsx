import './RegisterForm.css'
import loginIcon from './../../assets/LogoAnimeWLCuadrado.png'

export function RegisterForm() {
  return (
    <div className="register-form">
        <img src={loginIcon} alt="Register Icon" className="register-icon" />
      <form>
        <label htmlFor="username">Usuario:</label>
        <input type="text" id="username" name="username" required />
        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required />
        <label htmlFor="confirm-password">Confirmar contraseña:</label>
        <input type="password" id="confirm-password" name="confirm-password" required />
        <button type="submit" className="register-button">Registrarse</button>
       </form>
    </div>
    )
}
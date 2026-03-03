import './LoginForm.css'
import loginIcon from './../../assets/LogoAnimeWLCuadrado.png'

export function LoginForm() {
  return (
    <div className="login-form">
        <img src={loginIcon} alt="Login Icon" className="login-icon" />
      <form>
        <label htmlFor="username">Usuario:</label>
        <input type="text" id="username" name="username" required />
        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required />
        <div className="options">
          <div className="remember">
            <input type="checkbox" id="remember" name="remember" className="login-checkbox" />
            <label htmlFor="remember">Recuérdame</label>
          </div>
          <label htmlFor="forgot" className="forgot-password">Contraseña olvidada?</label>
        </div>
        <button type="submit" className="login-button">Iniciar sesión</button>
       </form>
    </div>
    )
}
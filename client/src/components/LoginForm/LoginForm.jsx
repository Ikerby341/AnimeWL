import './LoginForm.css'
import loginIcon from './../../assets/LogoAnimeWLCuadrado.png'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function LoginForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialState = location.state && typeof location.state === 'object'
    ? {
        username: location.state.username || '',
        password: location.state.password || ''
      }
    : { username: '', password: '' }

  const [formData, setFormData] = useState(initialState)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const { username, password } = formData
    if (!username.trim() || !password) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión.')
      }

      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-form">
        <img src={loginIcon} alt="Login Icon" className="login-icon" />
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Usuario:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <label htmlFor="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {error && <p className="form-error">{error}</p>}

        <div className="options">
          <div className="remember">
            <input type="checkbox" id="remember" name="remember" className="login-checkbox" />
            <label htmlFor="remember">Recuérdame</label>
          </div>
          <label htmlFor="forgot" className="forgot-password">¿Has olvidado tu contraseña?</label>
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Iniciando...' : 'Iniciar sesión'}
        </button>
        <div className="register-link">
          <p>------------------ ¿No tienes cuenta? ------------------</p>
          <a href="/register">Regístrate aquí</a>
        </div>
       </form>
    </div>
    )
}
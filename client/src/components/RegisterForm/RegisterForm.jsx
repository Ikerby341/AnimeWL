import './RegisterForm.css'
import loginIcon from './../../assets/LogoAnimeWLCuadrado.png'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function RegisterForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const { username, email, password, confirmPassword } = formData
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Por favor completa todos los campos.')
      return
    }
    if (!validateEmail(email)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nom: username, email, contrasenya: password })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar el usuario.')
      }

      setFormData({ username: '', email: '', password: '', confirmPassword: '' })
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-form">
      <img src={loginIcon} alt="Register Icon" className="register-icon" />
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

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
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

        <label htmlFor="confirm-password">Confirmar contraseña:</label>
        <input
          type="password"
          id="confirm-password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button type="submit" className="register-button" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        <div className="register-link">
          <p>------------------ ¿Ya tienes cuenta? ------------------</p>
          <a href="/login">Inicia sesión aquí</a>
        </div>
      </form>
    </div>
  )
}
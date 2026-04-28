import '../styles/ForgotPassword.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Por favor, introduce tu correo electrónico.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL || ''}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al procesar la solicitud.')
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <h2>Correo enviado</h2>
          <p>Si el correo electrónico que proporcionaste existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.</p>
          <p>Por favor, revisa tu bandeja de entrada y sigue las instrucciones.</p>
          <button onClick={() => navigate('/login')} className="back-button">
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>¿Has olvidado tu contraseña?</h2>
        <p>Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
          />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="back-link">
          <a href="/login">← Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  )
}
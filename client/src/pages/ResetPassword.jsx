import '../styles/ResetPassword.css'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(null)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false)
        return
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKENDURL || ''}/api/verify-reset-token?token=${token}`)
        const data = await response.json()
        setTokenValid(data.success)
      } catch (err) {
        setTokenValid(false)
        console.error('Error verificando token:', err)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Por favor, completa todos los campos.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL || ''}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token, 
          newPassword: password, 
          confirmPassword: confirmPassword 
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al restablecer la contraseña.')
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <p>Verificando token...</p>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2>Enlace inválido</h2>
          <p>El enlace de recuperación de contraseña es inválido o ha expirado.</p>
          <button onClick={() => navigate('/forgot-password')} className="back-button">
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2>Contraseña actualizada</h2>
          <p>Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <button onClick={() => navigate('/login')} className="back-button">
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Nueva contraseña</h2>
        <p>Introduce tu nueva contraseña.</p>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="password">Nueva contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
          />

          <label htmlFor="confirmPassword">Confirmar contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contraseña"
            required
          />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>

        <div className="back-link">
          <a href="/login">← Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  )
}

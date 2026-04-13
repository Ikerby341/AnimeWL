import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/session', {
        credentials: 'include'
      })

      if (response.status === 401) {
        // 401 es esperado cuando no hay sesión, no es un error
        setUser(null)
      } else {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password, remember = false) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ username, password, remember })
    })

    const data = await response.json()

    if (data.success) {
      setUser(data.user)
    }

    return data
  }

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const getUserInfo = () => {
    if (!user) return null

    return {
      nom: user.nom ?? '',
      email: user.email ?? '',
      id_anime_preferit: user.id_anime_preferit ?? null,
      id_anime_recomanat: user.id_anime_recomanat ?? null
    }
  }

  const isLoggedIn = Boolean(user)

  const value = {
    user,
    loading,
    login,
    logout,
    checkSession,
    isLoggedIn,
    getUserInfo
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
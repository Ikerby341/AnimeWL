import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext.js'
import { clearAuthToken, setAuthToken } from '../utils/authTokenFetch.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar sesion al cargar la aplicacion
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/session`, {
        credentials: 'include'
      })

      if (response.status === 401) {
        clearAuthToken()
        setUser(null)
      } else if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          if (data.token) setAuthToken(data.token)
          setUser(data.user)
        } else {
          clearAuthToken()
          setUser(null)
        }
      } else {
        console.error('Error checking session:', response.status)
        clearAuthToken()
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking session:', error)
      clearAuthToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password, remember = false) => {
    const response = await fetch(`${import.meta.env.VITE_BACKENDURL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ username, password, remember })
    })

    const data = await response.json()

    if (data.success) {
      if (data.token) setAuthToken(data.token)
      setUser(data.user)
    } else {
      clearAuthToken()
    }

    return data
  }

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKENDURL}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      clearAuthToken()
      setUser(null)
    } catch (error) {
      console.error('Error during logout:', error)
      clearAuthToken()
      setUser(null)
    }
  }

  const getUserInfo = () => {
    if (!user) return null

    return {
      nom: user.nom ?? '',
      email: user.email ?? '',
      id_anime_preferit: user.id_anime_preferit ?? null,
      id_anime_recomanat: user.id_anime_recomanat ?? null,
      img_url: user.img_url ?? null,
      isAdmin: user.isAdmin === true
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

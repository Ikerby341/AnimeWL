import { Navigate, Routes, Route } from 'react-router-dom'
import Home from './pages/home.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import Directory from './pages/directory.jsx'
import Favorites from './pages/favorites.jsx'
import Profile from './pages/profile.jsx'
import PublicProfile from './pages/publicProfile.jsx'
import Details from './pages/details.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/directory' element={<Directory />} />
          <Route path='/favorites' element={<Favorites />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/:userId' element={<PublicProfile />} />
          <Route path='/details/:id' element={<Details />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/terminos-y-condiciones' element={<Terms />} />
          <Route path='/politica-de-privacidad' element={<Privacy />} />
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App

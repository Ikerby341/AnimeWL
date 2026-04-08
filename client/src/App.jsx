import './styles/App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/home.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import Directory from './pages/directory.jsx'
import Favorites from './pages/favorites.jsx'
import Profile from './pages/profile.jsx'
import Details from './pages/details.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/directory' element={<Directory />} />
        <Route path='/favorites' element={<Favorites />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/details/:id' element={<Details />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
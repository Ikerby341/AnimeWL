import { Navbar } from '../components/NavBar/NavBar.jsx';
import { LoginForm } from '../components/LoginForm/LoginForm.jsx';
import Footer from '../components/Footer/Footer.jsx';
import '../styles/login.css'

export default function Login() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Navbar profile={false} searchBar={false} favorites={false} directory={false} />
      <div className="content">
        <br />
        <h1 className="title">INICIAR SESIÓN</h1>
        <LoginForm />
      </div>
      <Footer />
    </div>
  )
}
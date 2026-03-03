import { Navbar } from '../components/NavBar/NavBar.jsx';
import { LoginForm } from '../components/LoginForm/LoginForm.jsx';
import '../styles/login.css'

export default function Login() {
  return (
    <div>
      <Navbar profile={false} searchBar={false} favorites={false} directory={false} />
      <div className="content">
        <br />
        <h1 className="title">INICIAR SESIÓN</h1>
        <LoginForm />
      </div>
    </div>
  )
}
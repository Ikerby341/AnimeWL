import { Navbar } from '../components/NavBar/NavBar.jsx';
import { RegisterForm } from '../components/RegisterForm/RegisterForm.jsx';
import '../styles/register.css'

export default function Register() {
    return (
        <div>
            <Navbar profile={false} searchBar={false} favorites={false} directory={false} />
            <div className="content">
                <br />
                <h1 className="title">REGISTRARSE</h1>
                <RegisterForm />
            </div>   
        </div>
    )
}
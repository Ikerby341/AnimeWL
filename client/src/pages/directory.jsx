import { Navbar } from '../components/NavBar/NavBar.jsx'
import '../styles/directory.css'

export default function Directory() {
  return (
    <div>
      <Navbar directory={false} />
      <div className="content">
        <br />
        <h1>DIRECTORIO DE ANIMES</h1>
      </div>
    </div>
  )
}
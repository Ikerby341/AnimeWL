import { Link } from 'react-router-dom'
import './ButtonNavBar.css'

export function ButtonNavBar({ link, img, paddingLeft }) {
  return (
    <Link to={link}>
      <button className="buttonNavBar" style={{ paddingLeft: paddingLeft }}>
        <img src={img} alt="Icon" className="icon" />
      </button>
    </Link>
  )
}
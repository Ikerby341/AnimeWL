import { Link } from 'react-router-dom';
import './ButtonNavBar.css';

function BotoBarraNavegacio({ link, img, icon, paddingLeft, ariaLabel = 'Icon' }) {
  return (
    <Link to={link}>
      <button className="buttonNavBar" style={{ paddingLeft: paddingLeft }} aria-label={ariaLabel} title={ariaLabel}>
        {icon ?
        <span className="icon icon-svg">{icon}</span> :

        <img src={img} alt={ariaLabel} className="icon" />
        }
      </button>
    </Link>);

}export { BotoBarraNavegacio };
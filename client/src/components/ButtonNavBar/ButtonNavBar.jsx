import './ButtonNavBar.css'

export function ButtonNavBar({ img, paddingLeft }) {
  return (
      <button className="buttonNavBar" style={{ paddingLeft: paddingLeft }}>
        <img src={img} alt="Icon" className="icon" />
      </button>
  )
}
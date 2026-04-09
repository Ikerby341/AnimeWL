import './ProfilePage.css';

export function ProfilePage() {
    return (
        <div className="profile-page">
            <div className="profile-options">
                <label className="selected-page">Perfil</label>
                <button className="not-selected-page">Configuración</button>
                <button className="not-selected-page">Estadísticas</button>
            </div>
            <div className="profile-content">
            </div>
        </div>
    );
}

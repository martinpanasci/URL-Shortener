import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token'); // Verificar si hay un token

  const handleLoginRedirect = () => {
    if (isAuthenticated) {
      navigate('/welcome'); // Redirigir a la página de bienvenida
    } else {
      navigate('/login'); // Redirigir a la página de login
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <img src="https://i.imgur.com/hkOQJFY.jpeg" alt="Logo de Martín" />
        </div>
        <nav className="header-nav">
          <a href="/" className="nav-link">Inicio</a>
          {!isAuthenticated ? (
            <>
              <button onClick={() => navigate('/login')} className="nav-link">Login</button>
              <button onClick={() => navigate('/register')} className="nav-link">Register</button>
            </>
          ) : (
            <button onClick={handleLoginRedirect} className="nav-link">Cuenta</button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

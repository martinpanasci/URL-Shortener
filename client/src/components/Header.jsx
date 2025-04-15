import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // Estado del menú
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLoginRedirect = () => {
    navigate(isAuthenticated ? '/welcome' : '/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <img src="https://i.imgur.com/hkOQJFY.jpeg" alt="Logo de Martín" />
          </Link>
        </div>

        {/* Menú hamburguesa */}
        <button className="hamburger-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </button>

        {/* Navegación */}
        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Inicio</Link>
          {!isAuthenticated ? (
            <>
              <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="nav-link">Login</button>
              <button onClick={() => { navigate('/register'); setMenuOpen(false); }} className="nav-link">Register</button>
            </>
          ) : (
            <button onClick={() => { handleLoginRedirect(); setMenuOpen(false); }} className="nav-link">Cuenta</button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

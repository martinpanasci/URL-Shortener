import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.email) {
      setFeedback({ message: 'El email es obligatorio', type: 'error' });
      return;
    }
    if (!validateEmail(formData.email)) {
      setFeedback({ message: 'El formato del email no es válido', type: 'error' });
      return;
    }
    if (!formData.password) {
      setFeedback({ message: 'La contraseña es obligatoria', type: 'error' });
      return;
    }

    setLoading(true);
    setFeedback({ message: '', type: '' });

    try {
      // Llamada al backend con Axios
      const response = await axios.post(`${BASE_URL}/login`, {
        email: formData.email,
        contraseña: formData.password,
      });

      setFeedback({ message: response.data.message || 'Inicio de sesión exitoso', type: 'success' });
      // Almacenar el token si es necesario
      localStorage.setItem('token', response.data.token);
      // Redirigir al componente Welcome
      setTimeout(() => navigate('/welcome'), 500);
    } catch (error) {
      if (error.response) {
        setFeedback({ message: error.response.data.error || 'Error al iniciar sesión', type: 'error' });
      } else if (error.request) {
        setFeedback({ message: 'No se pudo conectar con el servidor', type: 'error' });
      } else {
        setFeedback({ message: 'Error desconocido. Inténtalo de nuevo.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Validar el formato del email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Iniciar Sesión</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="login-input"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="login-input"
          value={formData.password}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bt-login-submit"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Login'}
        </button>
      </form>
      <p className="forgot-password">
        <a href="/forgot-password" className="forgot-password-link">¿Olvidaste tu contraseña?</a>
      </p>
      {feedback.message && (
        <p className={`login-feedback ${feedback.type === 'error' ? 'error' : 'success'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}

export default Login;

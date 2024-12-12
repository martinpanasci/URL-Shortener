import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFeedback({ message: 'Todos los campos son obligatorios', type: 'error' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFeedback({ message: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    if (formData.password.length < 6) {
      setFeedback({ message: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
      return;
    }

    setLoading(true);
    setFeedback({ message: '', type: '' });

    try {
      // Llamada al backend
      const response = await axios.post('http://localhost:3000/register', {
        nombre: formData.name,
        email: formData.email,
        contraseña: formData.password,
      });

      setFeedback({ message: response.data.message || 'Registro exitoso. Por favor, verifica tu email.', type: 'success' });
    } catch (error) {
      if (error.response) {
        setFeedback({ message: error.response.data.error || 'Error al registrar usuario', type: 'error' });
      } else if (error.request) {
        setFeedback({ message: 'No se pudo conectar con el servidor', type: 'error' });
      } else {
        setFeedback({ message: 'Error desconocido. Inténtalo de nuevo.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Crear Cuenta</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          className="register-input"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="register-input"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="register-input"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar Contraseña"
          className="register-input"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bt-register-submit"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Registrarse'}
        </button>
      </form>
      {feedback.message && (
        <p className={`register-feedback ${feedback.type === 'error' ? 'error' : 'success'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}

export default Register;

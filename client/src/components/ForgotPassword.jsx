import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setFeedback('El email es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setFeedback('');
      const response = await axios.post(`${BASE_URL}/forgotpassword`, { email });
      setFeedback(response.data.message || 'Se envió un correo para recuperar la contraseña');
    } catch (error) {
      if (error.response) {
        setFeedback(error.response.data.error || 'Error al enviar la solicitud');
      } else {
        setFeedback('Error desconocido. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h1 className="forgot-password-title">Recuperar Contraseña</h1>
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="forgot-password-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="bt-forgot-password-submit" disabled={loading}>
          {loading ? 'Procesando...' : 'Enviar'}
        </button>
      </form>
      {feedback && <p className="forgot-password-feedback">{feedback}</p>}
    </div>
  );
}

export default ForgotPassword;

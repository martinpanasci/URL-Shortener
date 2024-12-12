import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ResetPassword.css';

function ResetPassword() {
  const { token } = useParams(); // Obtener el token de los parámetros de la URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setFeedback({ message: 'Ambos campos son obligatorios', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ message: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setFeedback({ message: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setFeedback({ message: '', type: '' });

      const response = await axios.post('http://localhost:3000/resetpassword', {
        token,
        newPassword: password,
      });

      setFeedback({ message: response.data.message || 'Contraseña actualizada con éxito', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      if (error.response) {
        setFeedback({ message: error.response.data.error || 'Error al actualizar la contraseña', type: 'error' });
      } else {
        setFeedback({ message: 'Error desconocido. Inténtalo de nuevo.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="reset-password-container">
      <h1 className="reset-password-title">Restablecer Contraseña</h1>
      <form className="reset-password-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          className="reset-password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="reset-password-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" className="bt-reset-password-submit" disabled={loading}>
          {loading ? 'Procesando...' : 'Restablecer'}
        </button>
      </form>
      {feedback.message && (
        <p className={`reset-password-feedback ${feedback.type === 'error' ? 'error' : 'success'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}

export default ResetPassword;

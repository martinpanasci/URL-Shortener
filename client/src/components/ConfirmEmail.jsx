import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ConfirmEmail.css';

const ConfirmEmail = () => {
  const { token } = useParams(); // Obtener el token desde los parámetros de la URL
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false); // Para diferenciar entre éxito y error

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/confirmEmail/${token}`);
        if (response.status === 200) {
          setFeedback(response.data.message || '¡Correo confirmado con éxito!');
          setSuccess(true);
        } else {
          setFeedback('Hubo un problema al confirmar tu correo. Por favor, inténtalo más tarde.');
          setSuccess(false);
        }
      } catch (error) {
        console.error('Error al confirmar el correo:', error);
        setFeedback(error.response?.data?.error || 'El enlace es inválido o ha expirado.');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      confirmEmail();
    } else {
      setFeedback('No se proporcionó un token válido.');
      setLoading(false);
      setSuccess(false);
    }
  }, [token]);

  return (
    <div className="confirm-email-container">
      {loading ? (
        <p>Confirmando tu correo, por favor espera...</p>
      ) : success ? (
        <>
          <h1 className="confirm-email-title">¡Cuenta confirmada!</h1>
          <p className="confirm-email-message">{feedback}</p>
          <button className="bt-go-login" onClick={() => navigate('/login')}>
            Ir al Login
          </button>
        </>
      ) : (
        <>
          <h1 className="confirm-email-title">Error al confirmar</h1>
          <p className="confirm-email-message">{feedback}</p>
          <button className="bt-go-login" onClick={() => navigate('/register')}>
            Registrarse nuevamente
          </button>
        </>
      )}
    </div>
  );
};

export default ConfirmEmail;

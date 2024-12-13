import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import '../styles/Welcome.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function Welcome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);

      const fetchUrls = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('Token no encontrado en el localStorage');
            return;
          }

          const response = await axios.get(`${BASE_URL}/usersUrls`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setUrls(response.data);
        } catch (error) {
          console.error('Error al obtener URLs:', error.response?.data || error.message);
        }
      };

      fetchUrls();
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/deleteUrls/${urlToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUrls((prevUrls) => prevUrls.filter((url) => url.id !== urlToDelete));
      setShowModal(false);
      setUrlToDelete(null);
    } catch (error) {
      console.error('Error al eliminar URL:', error.response?.data || error.message);
    }
  };

  const openModal = (id) => {
    setUrlToDelete(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setUrlToDelete(null);
  };

  return (
    <div className="welcome-container">
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <h1 className="welcome-title">¡Bienvenido!</h1>
          <p className="welcome-message">Hola, {user?.email || 'Usuario'}.</p>
          <button className="bt-go-back" onClick={handleLogout}>Cerrar Sesión</button>

          <h2 className="welcome-subtitle">Tus URLs Acortadas</h2>
          {urls.length > 0 ? (
            <table className="url-table">
              <thead>
                <tr>
                  <th>URL Larga</th>
                  <th>URL Corta</th>
                  <th>Clicks</th>
                  <th>Fecha de Expiración</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url.id}>
                    <td>
                      <a href={url.long_url} className="url-link" target="_blank" rel="noopener noreferrer" title={url.long_url}>
                        {url.long_url}
                      </a>
                    </td>
                    <td>
                      <p>
                        <a href={`${BASE_URL}/${url.short_url}`} className="url-link" target="_blank" rel="noopener noreferrer">
                          {`${BASE_URL}/${url.short_url}`}
                        </a>
                      </p>
                    </td>
                    <td>{url.click_count}</td>
                    <td>{url.expiry_date ? formatDate(url.expiry_date) : 'N/A'}</td>
                    <td className="action-cell">
                      <button className="bt-delete-url" onClick={() => openModal(url.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No tienes URLs acortadas todavía.</p>
          )}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <p>¿Estás seguro de que deseas eliminar esta URL?</p>
                <button className="bt-confirm" onClick={handleDelete}>Confirmar</button>
                <button className="bt-cancel" onClick={closeModal}>Cancelar</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Welcome;

import React, { useEffect, useState } from 'react';
import '../styles/URLShortener.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function URLShortener() {
    const [longUrl, setLongUrl] = useState('');
    const [shortUrl, setShortUrl] = useState(null);
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [isLoged, setIsLoged] = useState(false);
    const [customSlug, setCustomSlug] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!longUrl) {
            setFeedback('Por favor, ingresa una URL válida.');
            return;
        }

        if (showCustomInput && customSlug.trim() === '') {
            setFeedback('El slug personalizado no puede estar vacío.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(
                'http://localhost:3000/shortenURL',
                { longUrl, customSlug: showCustomInput ? customSlug : null },
                { headers }
            );

            setShortUrl(`http://localhost:3000/${response.data.shortUrl}`);
            setExpiryDate(new Date(response.data.expiryDate).toLocaleString());
            setFeedback('¡URL acortada con éxito!');
            setCustomSlug('');
            setShowCustomInput(false);
        } catch (error) {
            console.error('Error al acortar URL:', error);
            setFeedback(error.response?.data?.error || 'Error al procesar la URL. Inténtalo nuevamente.');
        }
    };

    const handleCopy = () => {
        if (shortUrl) {
            navigator.clipboard.writeText(shortUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoged(true);
        }
    }, []);

    return (
        <div className="url-shortener-container">
            <h1 className="url-shortener-title">Acortar URL</h1>
            <form className="url-shortener-form" onSubmit={handleSubmit}>
                <input
                    type="url"
                    placeholder="Ingrese URL"
                    className="url-input"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    required
                />
                {showCustomInput && (
                    <input
                        type="text"
                        placeholder="Slug personalizado (opcional)"
                        className="url-input"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                    />
                )}
                <div className="url-buttons">
                    <button type="submit" className="bt-url-submit">Acortar</button>
                    <button
                        type="button"
                        className="bt-url-custom"
                        onClick={() => setShowCustomInput(!showCustomInput)}
                    >
                        {showCustomInput ? 'Cancelar' : 'Personalizar'}
                    </button>
                </div>
            </form>
            {feedback && <p className="url-feedback">{feedback}</p>}
            {shortUrl && (
                <div className="url-result">
                    <p>
                        URL Corta:{' '}
                        <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                            {shortUrl}
                        </a>
                        <div className="url-copy-container">
                            <button className="bt-copy-button" onClick={handleCopy}>
                                <FontAwesomeIcon icon={faCopy} />
                            </button>
                            {copied && <span className="tooltip">¡Dirección copiada!</span>}
                        </div>
                    </p>
                    <p>Fecha de expiración: {expiryDate}</p>
                </div>
            )}
            {!isLoged && (
                <p className="url-not-loged">
                    Inicia sesión para guardar tus URLs acortadas en tu cuenta. <br />
                    Durarán el doble y podrás ver estadísticas detalladas.
                </p>
            )}
        </div>
    );
}

export default URLShortener;

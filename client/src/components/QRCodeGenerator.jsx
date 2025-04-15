import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import "../styles/QRCodeGenerator.css"

function QRCodeGenerator() {
    const [inputUrl, setInputUrl] = useState('');
    const [qrContent, setQrContent] = useState('');
    const qrRef = useRef(null); // 🔴 Crear una referencia para el SVG

    const handleGenerateQR = () => {
      if (inputUrl.trim() === '') {
        alert('Por favor, ingresa una URL válida.');
        return;
      }
      setQrContent(inputUrl);
    };

    const handleDownloadQR = () => {
      if (!qrContent) {
        alert('No hay un QR generado para descargar.');
        return;
      }

      const svg = qrRef.current?.querySelector('svg'); // 🔴 Obtener SVG desde el ref

      if (!svg) {
        alert('No se encontró el elemento SVG del QR.');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const pngFile = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = pngFile;
        link.click();
      };
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    };

    return (
      <div className="qr-generator-container">
        <h2 className="qr-generator-title">Generador de Código QR</h2>
        <div className="qr-generator-form">
          <input
            type="text"
            className="qr-input"
            placeholder="Ingrese URL"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          <button className="bt-qr-generate" onClick={handleGenerateQR}>
            Generar QR
          </button>
        </div>
        {qrContent && (
          <div className="qr-result" ref={qrRef}>
            <QRCode value={qrContent} className="qr-code" size={200} />
            <button className="bt-qr-download" onClick={handleDownloadQR}>
              Descargar QR
            </button>
          </div>
        )}
      </div>
    );
  }

export default QRCodeGenerator;

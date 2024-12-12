import React from 'react';
import URLShortener from '../components/URLShortener';
import QRCodeGenerator from '../components/QRCodeGenerator'; 

function Homepage() {
  return (
    <div className="homepage">
      <URLShortener />
      <QRCodeGenerator />
    </div>
  );
}

export default Homepage;
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
      console.log('Authorization header no enviado');
      return res.status(400).json({ error: 'Token no proporcionado' });
    }
  
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);    
      req.user = decoded; // Adjuntar datos decodificados al request
      next();
    } catch (error) {
      console.error('Error al verificar el token:', error.message);
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
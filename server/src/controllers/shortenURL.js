import { nanoid } from 'nanoid';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta';
const isValidSlug = (slug) => /^[a-zA-Z0-9_-]+$/.test(slug);


// Función para acortar URLs
export const shorten = async (req, res) => {
  const { longUrl, customSlug } = req.body;
  let userId = null; // Por defecto, no hay usuario asociado
  let expiryDate;

  if (!longUrl) {
    return res.status(400).json({ error: 'La URL es obligatoria.' });
  }

  // Validar slug personalizado si se proporciona
  if (customSlug && !isValidSlug(customSlug)) {
    return res.status(400).json({ error: 'El slug personalizado contiene caracteres inválidos.' });
  }

  try {
    // Verificar si el usuario está logeado (JWT en headers)
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id; // Extraer el user_id del token
    }

    // Calcular la fecha de expiración
    const daysToExpire = userId ? 10 : 5; // 10 días si está logeado, 5 si no
    expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysToExpire);

    // Verificar si el slug personalizado ya existe
    if (customSlug) {
      const [existingSlug] = await pool.query('SELECT id FROM urls WHERE short_url = ?', [customSlug]);
      if (existingSlug.length > 0) {
        return res.status(400).json({ error: 'El slug personalizado ya está en uso.' });
      }
    }

    // Generar URL corta (si no hay slug personalizado)
    const shortUrl = customSlug || nanoid(6);

    // Insertar en la base de datos
    await pool.query(
      'INSERT INTO urls (long_url, short_url, user_id, expiry_date) VALUES (?, ?, ?, ?)',
      [longUrl, shortUrl, userId, expiryDate]
    );

    res.json({ shortUrl, expiryDate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar la URL.' });
  }
};


export const redirectToLongUrl = async (req, res) => {
  const { shortUrl } = req.params;

  // Validar que el parámetro no esté vacío
  if (!shortUrl) {
    return res.status(400).json({ error: 'URL inválida' });
  }

  try {
    // Buscar la URL corta en la base de datos
    const [rows] = await pool.query('SELECT long_url FROM urls WHERE short_url = ?', [shortUrl]);

    if (rows.length === 0) {
      // Si no existe, retornar un error 404
      return res.status(404).json({ error: 'URL no encontrada' });
    }

    // Si existe, redirigir al usuario
    await pool.query('UPDATE urls SET click_count = click_count + 1 WHERE short_url = ?', [shortUrl]);
    const longUrl = rows[0].long_url;
    return res.redirect(longUrl);
  } catch (error) {
    console.error('Error al redirigir:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};


export const getUsersUrls = async (req, res) => {
  try {
    const userId = req.user?.id; // `req.user` debe estar establecido por el middleware
    if (!userId) {
      console.log('User ID no encontrado en el token');
      return res.status(400).json({ error: 'User ID no válido' });
    }

    const [urls] = await pool.query('SELECT * FROM urls WHERE user_id = ?', [userId]);

    if (urls.length === 0) {
      return res.status(404).json({ error: 'No se encontraron URLs para este usuario' });
    }

    res.json(urls);
  } catch (error) {
    console.error('Error al obtener URLs:', error.message);
    res.status(500).json({ error: 'Error al obtener URLs' });
  }
};

export const deleteUrls = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id; // `req.user` debería estar disponible si usas un middleware de autenticación

  if (!id) {
    return res.status(400).json({ error: 'ID de URL no proporcionado' });
  }

  try {
    // Verificar si la URL pertenece al usuario logueado
    const [rows] = await pool.query('SELECT * FROM urls WHERE id = ? AND user_id = ?', [id, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'URL no encontrada o no pertenece al usuario' });
    }

    // Eliminar la URL
    await pool.query('DELETE FROM urls WHERE id = ? AND user_id = ?', [id, userId]);

    res.status(200).json({ message: 'URL eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la URL:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};








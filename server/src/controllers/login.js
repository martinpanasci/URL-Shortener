import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta';
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || '8h';

export const loginUser = async (req, res) => {
    const { email, contraseña } = req.body;

    // Validaciones básicas
    if (!email || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el email existe en la base de datos
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const usuario = rows[0];

        // Verificar si la contraseña es correcta
        const isPasswordValid = await bcrypt.compare(contraseña, usuario.contraseña);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRATION }
        );

        // Devolver el token y la información básica del usuario
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
            },
        });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'El email es obligatorio' });
    }

    try {
        // Verificar si el email existe en la base de datos
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'El email no está registrado' });
        }

        // Generar un token de recuperación 
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `http://localhost:4000/reset-password/${resetToken}`;

        // Opcional: Guardar el token en la base de datos con expiración
        await pool.query('UPDATE users SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?', [resetToken, email]);

        // Configurar Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Enviar email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Recuperación de contraseña',
            html: `
          <h1>Recuperación de contraseña</h1>
          <p>Haz clic en el enlace para restablecer tu contraseña:</p>
          <a href="${resetLink}">Restablecer contraseña</a>
          <p>El enlace expirará en 1 hora.</p>
        `,
        });

        res.status(200).json({ message: 'Correo de recuperación enviado con éxito' });
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};


export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'El token y la nueva contraseña son obligatorios' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Validar la nueva contraseña
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña en la base de datos
        await pool.query('UPDATE users SET contraseña = ?, reset_token = NULL, reset_expires = NULL WHERE email = ?', [
            hashedPassword,
            decoded.email,
        ]);

        res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ error: 'El token ha expirado' });
        }
        console.error('Error en resetPassword:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
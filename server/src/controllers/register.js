import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Clave secreta y tiempo de expiración de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta';
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || '1h';

// Función para validar email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Función para registrar usuario
export const registerUser = async (req, res) => {
    const { nombre, email, contraseña } = req.body;

    if (!nombre || !email || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'El formato del email no es válido' });
    }

    try {
        // Verificar si el email ya existe
        const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Generar un token JWT
        const token = jwt.sign({ nombre, email, contraseña: hashedPassword }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });

        // Enviar email de confirmación
        const confirmUrl = `http://localhost:4000/confirmEmail/${token}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Confirma tu cuenta',
            html: `<h1>Hola, ${nombre}!</h1>
            <p>Haz clic en el enlace para confirmar tu cuenta:</p>
            <a href="${confirmUrl}">Confirmar cuenta</a>
            <p>Este enlace expirará en 1 hora.</p>
            `,
        });

        res.status(200).json({ message: 'Registro exitoso. Por favor, verifica tu email.' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error en el registro del usuario' });
    }
};

// Función para confirmar email
export const confirmEmail = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        console.log('Token no proporcionado');
        return res.status(400).json({ error: 'Token no proporcionado' });
    }

    try {
        console.log('Verificando token:', token);
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token decodificado con éxito:', decoded);

        const { nombre, email, contraseña } = decoded;

        // Verificar si el email ya está registrado
        const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            console.log('El email ya está registrado:', email);
            return res.status(400).json({ error: 'El email ya ha sido confirmado anteriormente.' });
        }

        // Insertar el usuario confirmado en la tabla `users`
        console.log('Insertando usuario en la base de datos:', { nombre, email });
        await pool.query('INSERT INTO users (nombre, email, contraseña) VALUES (?, ?, ?)', [nombre, email, contraseña]);

        console.log('Usuario insertado con éxito en la base de datos');
        res.status(200).json({ message: 'Cuenta confirmada con éxito. Ahora puedes iniciar sesión.' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('Token expirado:', error);
            return res.status(400).json({ error: 'El enlace de confirmación ha expirado. Por favor, regístrate de nuevo.' });
        }
        if (error.name === 'JsonWebTokenError') { 
            console.log('Error en el token:', error);
            return res.status(400).json({ error: 'El enlace de confirmación no es válido' });
        }
        console.error('Error al confirmar la cuenta:', error);
        res.status(500).json({ error: 'Error al confirmar la cuenta' });
    }
};

  
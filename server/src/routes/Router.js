import express from 'express';

import { shorten, redirectToLongUrl, getUsersUrls, deleteUrls } from '../controllers/shortenURL.js'
import { authenticate } from '../controllers/authenticate.js'
import { registerUser, confirmEmail } from '../controllers/register.js';
import { loginUser, forgotPassword, resetPassword } from '../controllers/login.js';

const router = express.Router();

router.post('/shortenURL', shorten); // Crear una URL corta
router.get('/usersurls', authenticate, getUsersUrls);
router.delete('/deleteUrls/:id', authenticate, deleteUrls);

//auth routes
router.post('/register', registerUser); 
router.get('/confirmEmail/:token', confirmEmail); 
router.post('/login', loginUser); 
router.post('/forgotPassword', forgotPassword);
router.post('/resetpassword', resetPassword);

router.get('/:shortUrl', redirectToLongUrl);

export default router;




import express from 'express';
import routes from './src/routes/Router.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Registrar rutas principales
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
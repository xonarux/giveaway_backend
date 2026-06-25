import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import numbersRouter from './routes/numbers.js';
import salesRouter from './routes/sales.js';

const app = express();
const port = process.env.PORT || 5000;

// CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// Rutas - IMPORTANTE: con extensión .js
app.use('/api/numbers', numbersRouter);
app.use('/api/sales', salesRouter);

app.listen(port, () => {
    console.log(`Servidor corriendo en ${process.env.HOST}:${port}`);
});
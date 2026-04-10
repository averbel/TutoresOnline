import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usuarioRoutes from './infrastructure/routes/usuarioRoutes';
import iaRoutes from './infrastructure/routes/iaRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/ia', iaRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'TutoresOn-Line API Running' });
});

app.listen(PORT, () => {
    console.log(`Servidor Backend funcionando correctamente en http://localhost:${PORT}`);
    console.log(`Verificando IA Key: ${process.env.GEMINI_API_KEY ? 'Cargada' : 'No encontrada en este ciclo'}`);
});

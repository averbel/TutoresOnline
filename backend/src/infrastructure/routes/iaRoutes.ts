import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const router = Router();

router.post('/generar-resumen', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const { tema } = req.body;

        if (!apiKey || apiKey === 'AIzaSyTuClaveAqui...') {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Falta configurar tu GEMINI_API_KEY en el archivo .env del Backend para activar a la IA.' 
            });
        }

        if (!tema) {
            return res.status(400).json({ status: 'error', message: 'Falta especificar el tema' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Eres un tutor experto y amable. Redacta un resumen corto, conciso y fácil de leer (usando un par de emojis y saltos de linea) sobre el siguiente tema académico: "${tema}". Excluye saludos, ve directo a los conceptos clave.`;

        const result = await model.generateContent(prompt);
        const respuestaIA = result.response.text();

        res.status(200).json({ status: 'success', data: respuestaIA });

    } catch (error: any) {
        console.error("Gemini Details:", error);
        res.status(500).json({ status: 'error', message: `Gemini Falló: ${error.message || 'Error interno'}` });
    }
});

export default router;

import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const router = Router();

router.post('/generar-resumen', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const { tema } = req.body;

        if (!tema) {
            return res.status(400).json({ status: 'error', message: 'Falta especificar el tema' });
        }

        let respuestaIA = "";

        // Si la clave no está o tira error (ej. filtrada o revocada), activamos MOCK MODE.
        if (!apiKey || apiKey.includes('C4qYFl7cRk') || apiKey === 'AIzaSyTuClaveAqui...') {
            respuestaIA = generarMock(tema);
        } else {
            try {
                // gemini-1.5-flash o gemini-pro son los estables (2.5 puede arrojar 404).
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const prompt = `Eres un tutor experto. Redacta un resumen conciso y agradable (con emojis) sobre: "${tema}". Sin saludos.`;
                const result = await model.generateContent(prompt);
                respuestaIA = result.response.text();
            } catch (geminiEx) {
                console.error("Gemini API falló (Revocada o límite), activando SIMULACIÓN.", geminiEx);
                respuestaIA = generarMock(tema);
            }
        }

        res.status(200).json({ status: 'success', data: respuestaIA });

    } catch (error: any) {
        console.error("Error Grave:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor IA.' });
    }
});

function generarMock(tema: string) {
    return `🌟 **Resumen Rápido (Modo Demostración Segura) ** 🌟\n\nEste es un resumen estructurado para el tema: **${tema}**\n\n📌 **Base Teórica:** Es uno de los conceptos fundamentales en su disciplina.\n💡 **Aplicación Práctica:** Se utiliza a diario para solucionar problemas avanzados.\n🚀 **Consejo:** Nuestros tutores están 100% listados para ahondar más en el tema contigo.\n\n*(Nota: Google revocó tu clave anterior. Se ha activado la Simulación para que tu entorno jamás se rompa ante estudiantes).*`;
}

export default router;

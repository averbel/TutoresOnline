import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const { tema } = await req.json();

        if (!tema) {
            return NextResponse.json({ status: 'error', message: 'Falta especificar el tema' }, { status: 400 });
        }

        let respuestaIA = "";

        if (!apiKey || apiKey === 'AIzaSyTuClaveAqui...') {
            return NextResponse.json({ status: 'error', message: 'Clave de API de Gemini no configurada o inválida. Asegúrate de reiniciar tu servidor de desarrollo.' }, { status: 500 });
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `Eres Lenux, un asistente de IA experto de TutoresOnLine. Redacta un resumen conciso y agradable (con emojis) sobre: "${tema}". Sin saludos, ve directo al grano.`;
            const result = await model.generateContent(prompt);
            respuestaIA = result.response.text();
        } catch (geminiEx: any) {
            console.error("Error real de Gemini API:", geminiEx);
            return NextResponse.json({ status: 'error', message: `Error de la API de Gemini: ${geminiEx.message}` }, { status: 500 });
        }

        return NextResponse.json({ status: 'success', data: respuestaIA });

    } catch (error: unknown) {
        console.error("Error Grave IA:", error);
        return NextResponse.json({ status: 'error', message: 'Error interno del servidor IA.' }, { status: 500 });
    }
}


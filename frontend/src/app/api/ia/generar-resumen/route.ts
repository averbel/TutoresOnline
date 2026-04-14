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

        // Si la clave no está o tira error (ej. filtrada o revocada), activamos MOCK MODE.
        if (!apiKey || apiKey.includes('C4qYFl7cRk') || apiKey === 'AIzaSyTuClaveAqui...') {
            respuestaIA = generarMock(tema);
        } else {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const prompt = `Eres un tutor experto. Redacta un resumen conciso y agradable (con emojis) sobre: "${tema}". Sin saludos.`;
                const result = await model.generateContent(prompt);
                respuestaIA = result.response.text();
            } catch (geminiEx) {
                console.error("Gemini API falló, activando SIMULACIÓN.", geminiEx);
                respuestaIA = generarMock(tema);
            }
        }

        return NextResponse.json({ status: 'success', data: respuestaIA });

    } catch (error: any) {
        console.error("Error Grave IA:", error);
        return NextResponse.json({ status: 'error', message: 'Error interno del servidor IA.' }, { status: 500 });
    }
}

function generarMock(tema: string) {
    return `🌟 **Resumen Rápido (Modo Demostración Segura) ** 🌟\n\nEste es un resumen estructurado para el tema: **${tema}**\n\n📌 **Base Teórica:** Es uno de los conceptos fundamentales en su disciplina.\n💡 **Aplicación Práctica:** Se utiliza a diario para solucionar problemas avanzados.\n🚀 **Consejo:** Nuestros tutores están listos para profundizar en esto contigo.\n\n*(Nota: Clave IA no disponible. Se ha activado la Simulación).*`;
}

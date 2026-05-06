import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const { tema } = await req.json();

        if (!tema) {
            return NextResponse.json({ status: 'error', message: 'Falta especificar el tema' }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ status: 'error', message: 'Clave de API de OpenRouter no configurada. Asegúrate de reiniciar tu servidor de desarrollo.' }, { status: 500 });
        }

        try {
            const prompt = `Eres Lenux, un asistente de IA experto de TutoresOnLine. Redacta un resumen conciso y agradable (con emojis) sobre: "${tema}". Sin saludos, ve directo al grano.`;
            
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "TutoresOnLine"
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-exp:free",
                    messages: [
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(`OpenRouter Error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            const respuestaIA = data.choices[0].message.content;

            return NextResponse.json({ status: 'success', data: respuestaIA });
        } catch (iaError: unknown) {
            console.error("Error real de OpenRouter API:", iaError);
            const errorMessage = iaError instanceof Error ? iaError.message : "Error desconocido";
            return NextResponse.json({ status: 'error', message: `Error de la API: ${errorMessage}` }, { status: 500 });
        }

    } catch (error: unknown) {
        console.error("Error Grave IA:", error);
        return NextResponse.json({ status: 'error', message: 'Error interno del servidor IA.' }, { status: 500 });
    }
}

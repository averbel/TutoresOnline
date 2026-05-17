type NotificacionTipo = 'email' | 'sms' | 'whatsapp';

type NotificacionPayload = {
  destino: string;
  asunto?: string;
  mensaje: string;
};

async function enviarEmail(payload: NotificacionPayload): Promise<boolean> {
  try {
    // Integración con Resend (requiere RESEND_API_KEY en .env)
    // const res = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@tutoresonline.com',
    //     to: payload.destino,
    //     subject: payload.asunto || 'Notificación TutoresOnLine',
    //     text: payload.mensaje,
    //   }),
    // });
    // return res.ok;

    console.log(`[EMAIL] Para: ${payload.destino} | Asunto: ${payload.asunto} | Mensaje: ${payload.mensaje}`);
    return true;
  } catch {
    return false;
  }
}

async function enviarSMS(payload: NotificacionPayload): Promise<boolean> {
  try {
    // Integración con Twilio (requiere TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await twilio.messages.create({
    //   body: payload.mensaje,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: payload.destino,
    // });

    console.log(`[SMS] Para: ${payload.destino} | Mensaje: ${payload.mensaje}`);
    return true;
  } catch {
    return false;
  }
}

async function enviarWhatsApp(payload: NotificacionPayload): Promise<boolean> {
  try {
    // Integración con Twilio WhatsApp (requiere TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER)
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await twilio.messages.create({
    //   body: payload.mensaje,
    //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    //   to: `whatsapp:${payload.destino}`,
    // });

    console.log(`[WHATSAPP] Para: ${payload.destino} | Mensaje: ${payload.mensaje}`);
    return true;
  } catch {
    return false;
  }
}

export async function enviarNotificacion(
  tipo: NotificacionTipo,
  payload: NotificacionPayload
): Promise<boolean> {
  switch (tipo) {
    case 'email': return enviarEmail(payload);
    case 'sms': return enviarSMS(payload);
    case 'whatsapp': return enviarWhatsApp(payload);
    default: return false;
  }
}

export function generarMensajeReserva(nombreEstudiante: string, nombreTutor: string, materia: string, fecha: Date): string {
  return `🎓 TutoresOnLine - Nueva reserva\n\nEstudiante: ${nombreEstudiante}\nTutor: ${nombreTutor}\nMateria: ${materia}\nFecha: ${fecha.toLocaleString()}\n\nGracias por usar TutoresOnLine.`;
}

export function generarMensajeConfirmacion(nombreTutor: string, nombreEstudiante: string, urlEncuentro: string, fecha: Date): string {
  return `✅ TutoresOnLine - Tutoría Confirmada\n\nTutor: ${nombreTutor}\nEstudiante: ${nombreEstudiante}\nFecha: ${fecha.toLocaleString()}\nLink: ${urlEncuentro}\n\n¡La sesión está lista!`;
}

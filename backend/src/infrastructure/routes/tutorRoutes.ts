import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// ==========================================
// DISPONIBILIDAD HORARIA DEL TUTOR
// ==========================================

// Obtener disponibilidades de un tutor
router.get('/:id/disponibilidades', async (req, res) => {
    try {
        const { id } = req.params;
        const disponibilidades = await prisma.disponibilidad.findMany({
            where: { tutorId: id },
            orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }]
        });
        res.json({ status: 'success', data: disponibilidades });
    } catch (error) {
        console.error("Error obteniendo disponibilidades:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// Guardar/Actualizar disponibilidades de un tutor (Reemplazo total)
router.post('/:id/disponibilidades', async (req, res) => {
    try {
        const { id } = req.params;
        // { disponibilidades: [{ diaSemana: 1, horaInicio: '14:00', horaFin: '16:00' }, ...] }
        const { disponibilidades } = req.body;

        if (!Array.isArray(disponibilidades)) {
            return res.status(400).json({ status: 'error', message: 'El payload debe contener un array en la propiedad disponibilidades' });
        }

        // Primero borramos todas las anteriores
        await prisma.disponibilidad.deleteMany({
            where: { tutorId: id }
        });

        // Insertamos las nuevas
        if (disponibilidades.length > 0) {
            await prisma.disponibilidad.createMany({
                data: disponibilidades.map((d: any) => ({
                    tutorId: id,
                    diaSemana: d.diaSemana,
                    horaInicio: d.horaInicio,
                    horaFin: d.horaFin
                }))
            });
        }

        // Recuperamos las nuevas que insertamos (para enviarlas con IDs generados si fuesen necesarios)
        const nuevasDisponibilidades = await prisma.disponibilidad.findMany({
            where: { tutorId: id },
            orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }]
        });

        res.json({ status: 'success', data: nuevasDisponibilidades });
    } catch (error) {
        console.error("Error guardando disponibilidades:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ==========================================
// GESTION DE SOLICITUDES DE TUTORIA
// ==========================================

// Obtener todas las solicitudes pendientes de un tutor
router.get('/:id/solicitudes', async (req, res) => {
    try {
        const { id } = req.params;
        const solicitudes = await prisma.tutoria.findMany({
            where: {
                tutorId: id,
                estado: {
                    in: ['PENDIENTE', 'ACEPTADA']
                }
            },
            include: {
                estudiante: {
                    include: { usuario: true }
                },
                materia: true
            },
            orderBy: {
                fechaInicio: 'asc'
            }
        });
        res.json({ status: 'success', data: solicitudes });
    } catch (error) {
        console.error("Error obteniendo solicitudes:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// Cambiar estado de una tutoría (Aceptar / Rechazar)
// (Acá en vez de rutear localmente la tutoria, lo agregamos como un endpoint suelto o anidado)
router.put('/tutorias/:tutoria_id/estado', async (req, res) => {
    try {
        const { tutoria_id } = req.params;
        const { estado } = req.body; // 'ACEPTADA' o 'RECHAZADA'

        if (!['ACEPTADA', 'RECHAZADA'].includes(estado)) {
            return res.status(400).json({ status: 'error', message: 'Estado inválido' });
        }

        let urlEncuentroGenerada = null;

        if (estado === 'ACEPTADA') {
            // Generar una URL única y segura para Jitsi Meet
            urlEncuentroGenerada = `https://meet.jit.si/TutoresOnLine-${tutoria_id}-${Date.now()}`;
        }

        const tutoriaActualizada = await prisma.tutoria.update({
            where: { id: tutoria_id },
            data: { 
                estado,
                urlEncuentro: urlEncuentroGenerada
            }
        });

        res.json({ status: 'success', data: tutoriaActualizada });
    } catch (error) {
        console.error("Error actualizando tutoría:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

export default router;

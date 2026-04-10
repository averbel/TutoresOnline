import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// Endpoint real: Cargar a los Tutores desde Supabase
router.get('/tutores', async (req, res) => {
    try {
        const tutores = await prisma.tutor.findMany({
            include: {
                usuario: true, // Trae el nombre, correo y teléfono
                materias: {    // Trae las materias que dicta y su tarifa
                    include: { materia: true }
                }
            }
        });
        
        res.json(tutores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error interno conectando a Supabase' });
    }
});

// Endpoint real: Registrar un Estudiante de prueba
router.post('/estudiantes', async (req, res) => {
    try {
        const { nombreCompleto, email, passwordHash, gradoAcademico } = req.body;
        
        const nuevoEstudiante = await prisma.usuario.create({
            data: {
                nombreCompleto,
                email,
                passwordHash,
                rol: 'ESTUDIANTE',
                estudiante: {
                    create: { gradoAcademico }
                }
            },
            include: { estudiante: true }
        });

        res.status(201).json({ status: 'success', data: nuevoEstudiante });
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: 'error', message: 'Posible email duplicado o formato inválido' });
    }
});

// Endpoint real: Generar un inicio de sesión
router.post('/login', async (req, res) => {
    try {
        const { email, passwordHash } = req.body;
        
        // Buscamos exacto el usuario en BD
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        // Validamos la contraseña cruda (demo mode)
        if (!usuario || usuario.passwordHash !== passwordHash) {
            return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
        }

        // Extraemos lo que necesitamos devolverle al Frontend
        const sesionData = {
            id: usuario.id,
            nombreCompleto: usuario.nombreCompleto,
            email: usuario.email,
            rol: usuario.rol
        };

        res.status(200).json({ status: 'success', data: sesionData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Falla al procesar el Login' });
    }
});

// Endpoint real: Registrar un Tutor
router.post('/tutores_registro', async (req, res) => {
    try {
        const { nombreCompleto, email, passwordHash, experiencia, especialidad } = req.body;
        
        // Empaquetamos la experiencia en la biografia con un formato estructurado secretamente
        const biografiaPayload = JSON.stringify({
            experienciaAños: experiencia,
            especialidadPrincipal: especialidad
        });

        const nuevoTutor = await prisma.usuario.create({
            data: {
                nombreCompleto,
                email,
                passwordHash,
                rol: 'TUTOR',
                tutor: {
                    create: { 
                        biografia: biografiaPayload,
                        reputacionPromedio: 5.0 // Empieza con 5 estrellas!
                    }
                }
            },
            include: { tutor: true }
        });

        res.status(201).json({ status: 'success', data: nuevoTutor });
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') return res.status(400).json({ status: 'error', message: 'Correo corporativo ya registrado.' });
        res.status(400).json({ status: 'error', message: 'Error interno o formato inválido' });
    }
});

export default router;

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registroEstudianteSchema = z.object({
  nombreCompleto: z.string().min(2, 'Nombre muy corto').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  gradoAcademico: z.enum(['Primaria', 'Secundaria', 'Universidad']),
});

export const registroTutorSchema = z.object({
  nombreCompleto: z.string().min(2, 'Nombre muy corto').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  experiencia: z.string().regex(/^\d+$/, 'Experiencia debe ser un número'),
  especialidad: z.string().min(2, 'Especialidad muy corta').max(100),
  materias: z.array(z.object({
    materiaId: z.string(),
    tarifaPorHora: z.number().min(1, 'Tarifa debe ser mayor a 0'),
  })).optional(),
});

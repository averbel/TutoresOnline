# Documentación General del Código — TutoresOnLine

## Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Base de Datos (Schema Prisma)](#4-base-de-datos-schema-prisma)
5. [Librería Compartida (`src/lib/`)](#5-librería-compartida-srclib)
6. [Middleware](#6-middleware)
7. [Estilos Globales (`globals.css`)](#7-estilos-globales)
8. [Componentes UI (`src/components/`)](#8-componentes-ui-srccomponents)
9. [Páginas Frontend (`src/app/`)](#9-páginas-frontend-srcapp)
10. [API Routes (`src/app/api/`)](#10-api-routes-srcappapi)
11. [Seed de Datos](#11-seed-de-datos)
12. [Archivos de Configuración](#12-archivos-de-configuración)

---

## 1. Visión General

**TutoresOnLine** es una plataforma web full-stack que conecta estudiantes con tutores para sesiones de aprendizaje virtuales. Los estudiantes pueden buscar tutores por materia, nivel educativo y reputación, reservar sesiones, unirse a videollamadas Jitsi, y dejar reseñas. Los tutores pueden gestionar su disponibilidad, aceptar/rechazar solicitudes, activar el modo "Flash" para atención inmediata, y recibir calificaciones.

La aplicación está construida con **Next.js 16** (App Router) como monolito full-stack, usando **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma 7** con **PostgreSQL** en **Supabase**, autenticación con **JWT** y asistencia IA vía **OpenRouter**.

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16.2.3, React 19.2.4, TypeScript 5 |
| Estilos | Tailwind CSS v4, PostCSS, CSS custom properties |
| Base de datos | PostgreSQL 14+ (Supabase), Prisma 7.7.0 ORM |
| Autenticación | JWT (HS256) con `jose`, cookies httpOnly |
| Contraseñas | `bcryptjs` con hash + salt |
| Validación | Zod v4 |
| Videollamadas | Jitsi Meet (iframe embebido) |
| IA | OpenRouter API (modelo free) |
| Iconos | Lucide React |
| Despliegue | Vercel (serverless) |

---

## 3. Estructura del Proyecto

```
TutoresOnLine/
│
├── package.json                    # Monorepo raíz (orquestador)
├── vercel.json                     # Config de despliegue Vercel
│
├── backend/                        # Backend Express (planeado, sin código fuente)
│   └── .env
│
├── frontend/                       # ★ APLICACIÓN PRINCIPAL ★
│   ├── package.json                # Dependencias y scripts
│   ├── next.config.ts              # Config de Next.js
│   ├── tsconfig.json               # TypeScript config
│   ├── postcss.config.mjs          # PostCSS + Tailwind
│   ├── prisma.config.ts            # Config de Prisma CLI
│   ├── eslint.config.mjs           # ESLint flat config
│   ├── .env / .env.local           # Variables de entorno
│   │
│   ├── prisma/
│   │   ├── schema.prisma           # Esquema de base de datos (7 modelos)
│   │   ├── migrations/             # Migraciones SQL
│   │   └── seed.ts                 # Datos de prueba
│   │
│   ├── src/
│   │   ├── middleware.ts           # Guard de rutas protegidas
│   │   │
│   │   ├── globals.css             # Estilos globales + Tailwind + tema tutor
│   │   │
│   │   ├── lib/
│   │   │   ├── auth.ts             # JWT sign/verify + getSession
│   │   │   ├── prisma.ts           # Cliente Prisma singleton
│   │   │   ├── schemas.ts          # Validación Zod
│   │   │   └── notificaciones.ts   # Notificaciones Email/SMS/WhatsApp
│   │   │
│   │   ├── components/
│   │   │   ├── ThemeWrapper.tsx     # Cliente: aplica tema según rol
│   │   │   └── Toast.tsx           # Sistema de notificaciones toast
│   │   │
│   │   └── app/
│   │       ├── layout.tsx          # Layout raíz (fuente, wrappers)
│   │       ├── page.tsx            # LOGIN / Landing page
│   │       │
│   │       ├── inicio/page.tsx     # Dashboard principal
│   │       ├── buscar/page.tsx     # Búsqueda de tutores + booking
│   │       ├── registro/page.tsx   # Registro de estudiantes
│   │       ├── registro-tutor/page.tsx  # Registro de tutores
│   │       ├── perfil/page.tsx     # Perfil / Workspace del usuario
│   │       ├── como-funciona/page.tsx   # Página informativa
│   │       │
│   │       └── api/
│   │           ├── auth/
│   │           │   ├── me/route.ts           # GET: sesión actual
│   │           │   └── logout/route.ts       # POST: cerrar sesión
│   │           │
│   │           ├── usuarios/
│   │           │   ├── login/route.ts        # POST: autenticar
│   │           │   ├── estudiantes/route.ts  # POST: registrar estudiante
│   │           │   ├── tutores/route.ts      # GET: listar/buscar tutores
│   │           │   └── tutores_registro/route.ts  # POST: registrar tutor
│   │           │
│   │           ├── materias/route.ts         # GET/POST: catálogo materias
│   │           │
│   │           ├── tutorias/
│   │           │   ├── route.ts              # POST: crear tutoría
│   │           │   └── [tutoria_id]/
│   │           │       └── resenas/route.ts  # GET/POST: reseñas
│   │           │
│   │           ├── tutores/
│   │           │   ├── flash/route.ts        # GET/PUT: modo flash
│   │           │   ├── [id]/
│   │           │   │   ├── disponibilidades/route.ts  # GET/POST: horarios
│   │           │   │   ├── solicitudes/route.ts      # GET: solicitudes
│   │           │   │   └── resenas/route.ts          # GET: reseñas recibidas
│   │           │   └── tutorias/[tutoria_id]/
│   │           │       └── estado/route.ts   # PUT: aceptar/rechazar/completar
│   │           │
│   │           ├── estudiantes/
│   │           │   └── [id]/
│   │           │       └── solicitudes/route.ts  # GET: solicitudes estudiante
│   │           │
│   │           └── ia/route.ts               # POST: chat con IA (Lenux)
```

---

## 4. Base de Datos (Schema Prisma)

**Archivo:** `frontend/prisma/schema.prisma`

### Modelo: Usuario
Entidad base que sigue un patrón de herencia 1:1 con Tutor y Estudiante.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador único |
| `nombreCompleto` | String | Nombre completo del usuario |
| `email` | String (único) | Correo electrónico |
| `passwordHash` | String | Hash bcrypt de la contraseña |
| `rol` | String | `ESTUDIANTE`, `TUTOR` o `ADMIN` |
| `telefono` | String? | Teléfono opcional |
| `fechaRegistro` | DateTime | Fecha de creación |

Relaciones:
- `tutor` → `Tutor?` (1:1, opcional)
- `estudiante` → `Estudiante?` (1:1, opcional)

**Propósito:** Un usuario puede ser solo estudiante, solo tutor, o ambos (aunque la UI de registro separa los roles). El campo `rol` facilita el control de acceso en la API.

### Modelo: Tutor
Extiende a Usuario. Almacena datos profesionales del tutor.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `usuarioId` | String (PK, FK→Usuario) | ID del usuario base |
| `biografia` | String? | JSON con experiencia y especialidad |
| `latitud` | Float? | Coordenada para búsquedas geográficas |
| `longitud` | Float? | Coordenada para búsquedas geográficas |
| `reputacionPromedio` | Float | Promedio de estrellas (0-5) |
| `activoAhoraFlash` | Boolean | Disponible para sesiones inmediatas |

Relaciones:
- `usuario` → `Usuario`
- `disponibilidades` → `Disponibilidad[]`
- `materias` → `TutorMateria[]`
- `tutoriasBrindadas` → `Tutoria[]`

### Modelo: Estudiante
Extiende a Usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `usuarioId` | String (PK, FK→Usuario) | ID del usuario base |
| `gradoAcademico` | String? | Primaria, Secundaria o Universidad |

Relaciones:
- `usuario` → `Usuario`
- `tutoriasReservadas` → `Tutoria[]`

### Modelo: Materia
Catálogo de materias académicas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador |
| `nombre` | String | Nombre de la materia |
| `nivelEducativo` | String | Primaria, Secundaria o Universidad |

Relaciones:
- `tutores` → `TutorMateria[]`
- `tutorias` → `Tutoria[]`

### Modelo: TutorMateria
Tabla intermedia (many-to-many) entre Tutor y Materia, con tarifa por hora.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `tutorId` | String (PK compuesta) | ID del tutor |
| `materiaId` | String (PK compuesta) | ID de la materia |
| `tarifaPorHora` | Float | Precio por hora en S/ |

**Clave primaria compuesta:** `@@id([tutorId, materiaId])`

### Modelo: Disponibilidad
Bloques de horario semanal del tutor.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador |
| `tutorId` | String (FK→Tutor) | Tutor propietario |
| `diaSemana` | Int | 0=Domingo ... 6=Sábado |
| `horaInicio` | String | Formato HH:MM |
| `horaFin` | String | Formato HH:MM |

### Modelo: Tutoria
Sesión de tutoría. Núcleo del flujo de trabajo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador |
| `estudianteId` | String (FK→Estudiante) | Estudiante que reserva |
| `tutorId` | String (FK→Tutor) | Tutor asignado |
| `materiaId` | String (FK→Materia) | Materia de la sesión |
| `fechaInicio` | DateTime | Inicio programado |
| `fechaFin` | DateTime | Fin programado |
| `estado` | String | `PENDIENTE` → `ACEPTADA`/`RECHAZADA` → `COMPLETADA` |
| `modalidad` | String | `VIRTUAL` o `PRESENCIAL` |
| `urlEncuentro` | String? | Enlace Jitsi generado al aceptar |
| `notasIaGeneradas` | String? | Notas generadas por IA (futuro) |

Relaciones:
- `estudiante` → `Estudiante`
- `tutor` → `Tutor`
- `materia` → `Materia`
- `resenas` → `Resena[]`

### Modelo: Resena
Reseña y calificación de una tutoría completada.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | Identificador |
| `tutoriaId` | String (FK→Tutoria) | Tutoría reseñada |
| `calificacionEstrellas` | Int | 1 a 5 estrellas |
| `feedback` | String? | Comentario opcional |

---

## 5. Librería Compartida (`src/lib/`)

### `auth.ts` — Autenticación JWT

Dependencias: `jose` (SignJWT, jwtVerify), `next/headers` (cookies)

**Propósito:** Manejar la creación, verificación y obtención de sesiones JWT.

#### `signToken(payload: SessionPayload): Promise<string>`
- Recibe datos de sesión: `id`, `nombreCompleto`, `email`, `rol`
- Crea un JWT con algoritmo HS256
- Fija `issuedAt` y expiración a 7 días
- Usa `JWT_SECRET` del entorno o un fallback de desarrollo

#### `verifyToken(token: string): Promise<SessionPayload | null>`
- Verifica y decodifica un JWT
- Retorna `null` si el token es inválido o expiró

#### `getSession(): Promise<SessionPayload | null>`
- Lee la cookie `session` del request
- Llama a `verifyToken` con el valor obtenido
- Retorna los datos de sesión o `null`

### `prisma.ts` — Cliente Prisma Singleton

Dependencias: `pg` (Pool), `@prisma/adapter-pg`, `@prisma/client`

**Propósito:** Crear una única instancia de PrismaClient reutilizable (patrón singleton global) para evitar múltiples conexiones a la base de datos, especialmente durante hot-reload en desarrollo.

- Crea un `Pool` de PostgreSQL con SSL y `rejectUnauthorized: false`
- Adapta el pool con `PrismaPg` para Prisma
- Almacena la instancia en `globalThis` para prevenir recreación en desarrollo

### `schemas.ts` — Validación Zod

Dependencias: `zod`

**Propósito:** Esquemas de validación para los formularios de la aplicación.

#### `loginSchema`
- `email`: string, email válido
- `password`: string, mínimo 6 caracteres

#### `registroEstudianteSchema`
- `nombreCompleto`: string, 2-100 caracteres
- `email`: string, email válido
- `password`: string, mínimo 6 caracteres
- `gradoAcademico`: enum `Primaria | Secundaria | Universidad`

#### `registroTutorSchema`
- `nombreCompleto`: string, 2-100 caracteres
- `email`: string, email válido
- `password`: string, mínimo 6 caracteres
- `experiencia`: string, solo dígitos (regex `^\d+$`)
- `especialidad`: string, 2-100 caracteres
- `materias`: array opcional de `{ materiaId, tarifaPorHora }`

### `notificaciones.ts` — Servicio de Notificaciones

**Propósito:** Sistema plugin para enviar notificaciones a través de múltiples canales. Actualmente usa `console.log` como stub, con código comentado listo para integrar **Resend** (email) y **Twilio** (SMS/WhatsApp).

#### Funciones internas (privadas)
- `enviarEmail(payload)`: Envía email (stub con console.log)
- `enviarSMS(payload)`: Envía SMS (stub con console.log)
- `enviarWhatsApp(payload)`: Envía WhatsApp (stub con console.log)

#### Función pública
- `enviarNotificacion(tipo, payload)`: Orquesta según el tipo

#### Generadores de mensajes
- `generarMensajeReserva(nombreEstudiante, nombreTutor, materia, fecha)`: Plantilla para nueva reserva
- `generarMensajeConfirmacion(nombreTutor, nombreEstudiante, urlEncuentro, fecha)`: Plantilla para confirmación

---

## 6. Middleware

**Archivo:** `src/middleware.ts`

**Propósito:** Proteger rutas privadas redirigiendo al login si no hay sesión válida.

**Rutas protegidas:** `/inicio`, `/buscar`, `/perfil`, `/como-funciona`, `/registro-tutor`

**Funcionamiento:**
1. Verifica si la ruta solicitada está en la lista de protegidas
2. Si no está protegida, permite el paso (`NextResponse.next()`)
3. Si está protegida, busca la cookie `session`
4. Si no hay cookie o el token es inválido/expirado, redirige a `/` (login)
5. Si el token es inválido, además limpia la cookie

**Config de matcher:** `[ '/inicio/:path*', '/buscar/:path*', '/perfil/:path*', '/como-funciona/:path*', '/registro-tutor/:path*' ]`

---

## 7. Estilos Globales

**Archivo:** `src/app/globals.css`

**Propósito:** Estilos base, utilidades CSS, sistema de diseño con variables CSS custom properties, y tema diferenciado para tutores.

### Variables CSS (modo claro - estudiantes)
- `--background`: blanco (#ffffff)
- `--foreground`: azul oscuro (#1e293b)
- `--primary`: púrpura (#7c5cfc) — color principal de la marca
- `--primary-hover`: púrpura más oscuro
- `--border`: gris claro (#e2e8f0)

### Clases utilitarias
- `.btn-primary`: Botón principal (fondo púrpura, texto blanco)
- `.btn-secondary`: Botón secundario (borde, sin fondo)
- `.nav-link`: Enlace de navegación
- `.container`: Contenedor centrado (max-width: 1280px)
- `.header`, `.header-links`, `.header-actions`: Layout del header
- `.hero-section`, `.hero-title`, `.hero-subtitle`: Sección hero del dashboard
- `.search-bar-container`, `.search-field`: Barra de búsqueda tipo marketplace
- `.features-grid`, `.benefits-grid`, `.feature-card`: Grid de características
- `.tutors-grid`, `.tutor-card`: Grid de tarjetas de tutores
- `.glass-card`: Tarjeta con efecto glassmorphism (usado en perfil tutor)

### Tema Tutor (`body.theme-tutor`)
Cuando un tutor inicia sesión, se aplica la clase `theme-tutor` al `<body>`:
- Fondo oscuro (`--background: #1a1f2e`)
- Texto claro (`--foreground: #f8fafc`)
- Acento dorado/naranja (`--primary: #f59e0b`)
- Tarjetas con efecto glass (fondo semitransparente)

Este cambio se logra mediante el componente `ThemeWrapper`.

---

## 8. Componentes UI (`src/components/`)

### `ThemeWrapper.tsx` — Aplicador de Tema por Rol

**Tipo:** Cliente (`"use client"`)

**Propósito:** Determinar el rol del usuario autenticado y aplicar la clase CSS `theme-tutor` al `<body>` si es tutor, o removerla si es estudiante.

**Funcionamiento:**
1. En `useEffect`, hace fetch a `/api/auth/me`
2. Si la respuesta es `success` y `rol === 'TUTOR'`, agrega `theme-tutor` al body
3. Si no, remueve la clase
4. No renderiza nada visible: `return <>{children}</>`

### `Toast.tsx` — Sistema de Notificaciones Toast

**Tipo:** Cliente (`"use client"`)

**Propósito:** Sistema global de notificaciones emergentes usando patrón pub/sub.

#### Funciones
- `showToast(type, message)`: Función global que agrega un toast a la cola. Types: `success` | `error` | `info`

#### Componente `ToastContainer`
- Mantiene un array de toasts en estado
- Escucha eventos mediante un array de listeners (pub/sub)
- Cada toast se auto-destruye después de 4 segundos
- Renderiza los toasts en posición fixed (top-right)
- Incluye animación `slideIn` con CSS keyframes
- Colores: success (verde), error (rojo), info (azul), cada uno con icono

---

## 9. Páginas Frontend (`src/app/`)

### `layout.tsx` — Layout Raíz
- Importa la fuente Inter desde Google Fonts
- Define metadata (título: "TutoresOn-Line", descripción)
- Renderiza html con `lang="es"` y clase de fuente
- Wraps children con `ThemeWrapper` y `ToastContainer`

### `page.tsx` — Login / Landing Page

**Tipo:** Cliente

**Propósito:** Pantalla de inicio de sesión con diseño split-screen.

**Sección izquierda (branding):**
- Imagen de fondo tipo collage educativo con overlay oscuro
- Logo con icono 🎓 y nombre "TutoresOn-Line"
- Título: "Acelera tu aprendizaje real."
- Subtítulo promocional
- Etiqueta decorativa "Plataforma Segura" con backdrop-filter

**Sección derecha (formulario):**
- Título "Bienvenido de vuelta"
- Campos: email + contraseña
- Botón "Ingresar a la Plataforma"
- Enlace a registro de estudiantes
- Mensajes de error/success con estilos
- Al hacer submit: POST a `/api/usuarios/login`, redirige a `/inicio`

### `inicio/page.tsx` — Dashboard Principal

**Tipo:** Cliente

**Propósito:** Página principal después del login con buscador, tutores flash, IA Lenux, y listado de tutores.

**Estados manejados:**
- `session`: datos de sesión del usuario
- `tutores`: lista completa de tutores
- `tutoresFlash`: tutores con `activoAhoraFlash === true`
- `materiaQuery`, `ubicacionQuery`: filtros de búsqueda
- `iaTema`, `iaRespuesta`, `iaStatus`: estado del chat con IA

**Secciones:**
1. **Header** con logo, navegación, info de usuario y botón de cerrar sesión
2. **Hero section** con barra de búsqueda (materia, nivel, ubicación) y contador de tutores
3. **Tutores Flash** (si hay): sección destacada con fondo verde gradient y cards horizontales
4. **Lenux AI**: sección con input para generar resúmenes escolares mediante IA
5. **Características**: grid de 4 tarjetas (Tutores Calificados, Reserva Fácil, Videollamadas, Pago Seguro)
6. **Cómo funciona**: 3 pasos (Regístrate, Busca y Elige, Reserva y Aprende)
7. **Tutores Destacados**: grid de 6 cards con nombre, materia, rating, precio
8. **Banner CTA**: "¿Eres tutor? Únete a nuestra plataforma"

**Funciones auxiliares:**
- `getTutorImageStyle(nombre)`: asigna una imagen de Unsplash determinista basada en el nombre
- `renderStars(rating)`: renderiza estrellas ★
- `solicitarResumenIA()`: envía tema a `/api/ia` modo "resumen"
- `handleLogout()`: POST a `/api/auth/logout`

### `buscar/page.tsx` — Búsqueda de Tutores + Booking Modal

**Tipo:** Cliente

**Propósito:** Buscar tutores con filtros y reservar sesiones mediante modal.

**Estados manejados:**
- `session`: sesión del usuario
- `tutores`: resultados de búsqueda
- `materias`: catálogo de materias para filtro
- `searchTerm`, `filtroMateria`, `filtroNivel`, `filtroRepMin`: filtros
- `bookingTutor`, `bookingMateriaId`, `bookingFecha`, etc.: estado del modal de reserva
- `loading`: indicador de carga

**Características:**
1. Header con navegación
2. Hero de búsqueda con inputs: materia, materia (select), nivel, reputación mínima
3. Grid de tutor cards con imagen, nombre, ubicación, rating, materias, precio
4. Botón "Reservar" (solo visible para estudiantes)
5. Modal de reserva con:
   - Selector de materia del tutor
   - Fecha y hora de inicio
   - Duración (30min a 2h)
   - Validación de campos
   - Estados: error, success, loading

**API:** GET `/api/usuarios/tutores` con parámetros de filtro

### `registro/page.tsx` — Registro de Estudiante

**Tipo:** Cliente

**Propósito:** Formulario de registro para nuevos estudiantes.

**Estados:** `formData` (nombre, email, password, gradoAcademico), `status`

**Campos:**
- Nombre completo
- Correo electrónico
- Grado académico (select: Primaria/Secundaria/Universidad)
- Contraseña

**Flujo:** POST a `/api/usuarios/estudiantes`, muestra mensaje de éxito con enlace al login.

### `registro-tutor/page.tsx` — Registro de Tutor

**Tipo:** Cliente

**Propósito:** Formulario de registro para nuevos tutores, con selección de materias y tarifas.

**Estados:**
- `session`: sesión (para mostrar header condicional)
- `materias`: catálogo completo para selector
- `formData`: nombre, email, password, experiencia, especialidad, materias[]
- `status`, `errorMsg`

**Características:**
1. Split-screen: lado izquierdo con texto promocional y beneficios
2. Lado derecho con formulario:
   - Nombre y email en grid 2 columnas
   - Experiencia y especialidad en grid 2 columnas
   - Selector de materias con tarifa por hora editable
   - Las materias seleccionadas se muestran con input de precio y botón de eliminar
   - Contraseña

**API:** POST `/api/usuarios/tutores_registro`

### `perfil/page.tsx` — Perfil / Workspace

**Tipo:** Cliente

**Propósito:** Panel de control con vistas diferenciadas para tutor y estudiante.

**Estados compartidos:**
- `session`: sesión del usuario
- `disponibilidades`: horarios del tutor
- `solicitudes`: tutorías pendientes/aceptadas/completadas
- `loading`, `isSaving`
- `activeCallId`: ID de la videollamada activa
- `resenas`: reseñas recibidas (tutor) o formulario de reseña (estudiante)

#### Vista Tutor
1. **Sidebar**: avatar, nombre, toggle modo Flash (botón verde/gris)
2. **Configuración de Horarios**: lista de slots (día, hora inicio, hora fin) con botones para agregar/eliminar/guardar
3. **Próximas Tutorías**: cards con botón "Video" (abre iframe Jitsi) y "Completar"
4. **Solicitudes Entrantes**: botones Aceptar/Rechazar
5. **Tutorías Completadas**: listado
6. **Reseñas Recibidas**: estrellas + feedback

#### Vista Estudiante
1. **Bienvenida**: nombre, email, rol, contador de tutores disponibles
2. **Próximas Tutorías**: con botón para unirse a videollamada
3. **Solicitudes Pendientes**: con estado "Esperando confirmación"
4. **Tutorías Completadas**: con botón "Calificar" que abre formulario de reseña (1-5 estrellas + comentario)

**Funciones del lado del servidor:**
- `fetchUserData(user)`: carga datos según el rol del usuario
- `handleSaveDisponibilidad()`: guarda horarios vía POST
- `toggleFlash()`: activa/desactiva modo flash
- `updateEstadoTutoria(id, estado)`: acepta/rechaza solicitudes
- `completarTutoria(id)`: marca como completada
- `enviarResena(tutoriaId)`: envía reseña vía POST

### `como-funciona/page.tsx` — Página Informativa

**Tipo:** Cliente

**Propósito:** Página estática que explica cómo funciona la plataforma.

**Secciones:**
1. Algoritmo de Emparejamiento (IA categoriza tutores)
2. Reserva Inmediata (agenda y confirmación automática)
3. Pizarras Interactivas (dashboard con chat + webcam)

Cada sección tiene un icono, título y descripción.

---

## 10. API Routes (`src/app/api/`)

### Autenticación

#### `GET /api/auth/me`
- **Propósito:** Obtener datos de la sesión actual
- **Seguridad:** Requiere cookie `session` válida
- **Respuesta éxito:** `{ status: "success", data: SessionPayload }`
- **Respuesta error:** `{ status: "error", message: "No autenticado" }` (401)

#### `POST /api/auth/logout`
- **Propósito:** Cerrar sesión eliminando la cookie
- **Respuesta:** `{ status: "success" }` + cookie vacía con `maxAge: 0`

### Usuarios

#### `POST /api/usuarios/login`
- **Propósito:** Autenticar usuario con email y contraseña
- **Validación:** `loginSchema` (Zod)
- **Flujo:**
  1. Busca usuario por email en BD
  2. Compara contraseña con bcrypt
  3. Si es válido, firma JWT con `signToken()`
  4. Establece cookie httpOnly `session` con expiración de 7 días
- **Respuesta éxito:** `{ status: "success", data: sessionData }` (200)
- **Respuesta error:** `{ status: "error", message }` (400/401/500)

#### `POST /api/usuarios/estudiantes`
- **Propósito:** Registrar nuevo estudiante
- **Validación:** `registroEstudianteSchema` (Zod)
- **Flujo:**
  1. Hashea contraseña con bcrypt (salt rounds: 10)
  2. Crea `Usuario` con `rol: 'ESTUDIANTE'`
  3. Crea `Estudiante` relacionado con `gradoAcademico`
- **Manejo de errores:** Captura error P2002 (email duplicado)

#### `GET /api/usuarios/tutores`
- **Propósito:** Listar y buscar tutores con filtros
- **Parámetros query:** `materia`, `nivel`, `reputacionMin`, `flash`, `page`, `limit`
- **Flujo:**
  1. Construye filtro `where` dinámico
  2. Ejecuta `findMany` con `include` (usuario, materias, disponibilidades)
  3. Ordena por reputación descendente
  4. Retorna con metadatos de paginación
- **Respuesta:** `{ status: "success", data: Tutor[], meta: { page, limit, total, totalPages } }`

#### `POST /api/usuarios/tutores_registro`
- **Propósito:** Registrar nuevo tutor
- **Validación:** `registroTutorSchema` (Zod)
- **Flujo:**
  1. Hashea contraseña
  2. Serializa `biografia` como JSON con `experienciaAños` y `especialidadPrincipal`
  3. Crea `Usuario` con `rol: 'TUTOR'`
  4. Crea `Tutor` con reputación inicial 5.0
  5. Si hay materias, crea registros `TutorMateria` con tarifas

### Materias

#### `GET /api/materias`
- **Propósito:** Listar todas las materias ordenadas alfabéticamente

#### `POST /api/materias`
- **Propósito:** Crear una nueva materia
- **Body:** `{ nombre, nivelEducativo }`

### Tutorías

#### `POST /api/tutorias`
- **Propósito:** Crear una solicitud de tutoría (solo estudiantes)
- **Seguridad:** Requiere sesión con rol `ESTUDIANTE`
- **Validaciones:**
  - Campos requeridos: `tutorId`, `materiaId`, `fechaInicio`, `fechaFin`
  - `fechaFin` debe ser posterior a `fechaInicio`
  - Verifica solapamiento con tutorías existentes (PENDIENTE o ACEPTADA)
- **Flujo:**
  1. Crea `Tutoria` con estado `PENDIENTE` y modalidad `VIRTUAL`
  2. Envía notificación email al tutor
- **Respuesta éxito:** `{ status: "success", data: Tutoria }` (201)
- **Respuesta conflicto:** `{ status: "error", message }` (409) si hay solapamiento

### Reseñas

#### `GET|POST /api/tutorias/[tutoria_id]/resenas`

**POST:**
- **Propósito:** Crear reseña para una tutoría completada (solo el estudiante)
- **Validaciones:**
  - Calificación entre 1 y 5
  - Tutoría debe existir y estar COMPLETADA
  - Solo el estudiante que reservó puede reseñar
  - No se puede reseñar dos veces la misma tutoría
- **Flujo:**
  1. Crea la reseña
  2. Recalcula el promedio de reputación del tutor con `aggregate`
  3. Actualiza `reputacionPromedio` del tutor

**GET:**
- **Propósito:** Obtener la reseña de una tutoría específica

### Tutores — Flash

#### `GET|PUT /api/tutores/flash`

**GET:**
- **Propósito:** Listar tutores con `activoAhoraFlash = true`

**PUT:**
- **Propósito:** Activar/desactivar modo flash del tutor autenticado
- **Seguridad:** Solo usuarios con rol `TUTOR`
- **Body:** `{ activo: boolean }`

### Tutores — Disponibilidades

#### `GET|POST /api/tutores/[id]/disponibilidades`

**GET:**
- **Propósito:** Obtener los horarios semanales de un tutor
- **Respuesta:** Array de `Disponibilidad` ordenado por día y hora

**POST:**
- **Propósito:** Reemplazar todos los horarios del tutor
- **Flujo:**
  1. Elimina todas las disponibilidades existentes del tutor
  2. Crea nuevas con los datos enviados
  3. Retorna la lista actualizada
- **Body:** `{ disponibilidades: [{ diaSemana, horaInicio, horaFin }] }`

### Tutores — Solicitudes

#### `GET /api/tutores/[id]/solicitudes`
- **Propósito:** Obtener solicitudes PENDIENTES y ACEPTADAS de un tutor
- **Incluye:** datos del estudiante y materia
- **Orden:** por fecha de inicio ascendente

### Tutores — Reseñas Recibidas

#### `GET /api/tutores/[id]/resenas`
- **Propósito:** Obtener todas las reseñas de un tutor
- **Incluye:** nombre del estudiante y nombre de la materia
- **Orden:** descendente por ID

### Tutorías — Estado

#### `PUT /api/tutores/tutorias/[tutoria_id]/estado`
- **Propósito:** Cambiar el estado de una tutoría
- **Estados permitidos:** `ACEPTADA`, `RECHAZADA`, `COMPLETADA`
- **Flujo al aceptar:**
  1. Genera URL de Jitsi: `https://meet.jit.si/TutoresOnLine-{id}-{timestamp}`
  2. Actualiza `urlEncuentro` en la tutoría
  3. Envía email de confirmación al estudiante con el enlace
- **Flujo al rechazar:** solo cambia estado
- **Flujo al completar:** solo cambia estado

### Estudiantes — Solicitudes

#### `GET /api/estudiantes/[id]/solicitudes`
- **Propósito:** Obtener solicitudes PENDIENTES y ACEPTADAS de un estudiante
- **Incluye:** datos del tutor y materia

### IA (Lenux)

#### `POST /api/ia`
- **Propósito:** Chat con asistente IA Lenux vía OpenRouter
- **Modos disponibles:**
  - `asistente`: asistente educativo general (dudas académicas)
  - `recomendador`: recomienda tutores según necesidades
  - `resumen`: genera resúmenes educativos estructurados
  - `soporte`: responde FAQs sobre la plataforma
- **Body:** `{ modo, mensaje, historial? }`
- **Flujo:**
  1. Valida que exista `OPENROUTER_API_KEY`
  2. Construye array de mensajes: system prompt (según modo) + historial + mensaje actual
  3. Llama a OpenRouter API (`openrouter/free`)
  4. Retorna la respuesta del modelo
- **System prompts:** Cada modo tiene un prompt en español con emojis, personalidad "Lenux"

---

## 11. Seed de Datos

**Archivo:** `frontend/prisma/seed.ts`

**Propósito:** Poblar la base de datos con datos de demostración para desarrollo.

**Comando:** `npm run seed` (ejecuta `npx tsx prisma/seed.ts`)

**Datos insertados:**
- **20 materias** (Matemáticas, Álgebra, Geometría, Cálculo I/II, Física, Química, Biología, Inglés Básico/Avanzado, Programación, Historia, Literatura, Filosofía, Economía, Arte, Música, Lectura, Ciencias Naturales, Geografía)
- **5 tutores demo:**
  - Carlos Mendoza (Perú) — Matemáticas — 4.5-5.0 estrellas
  - Ana López (México) — Inglés Avanzado
  - Luis García (Colombia) — Programación
  - María Torres (Argentina) — Física
  - Pedro Sánchez (Chile) — Química
- **1 estudiante demo:** Estudiante Demo (Universidad)

**Credenciales demo:** Todos usan contraseña `123456`

**Nota:** El seed usa `upsert` para ser idempotente (se puede ejecutar múltiples veces).

---

## 12. Archivos de Configuración

### `frontend/package.json`
- **Scripts:** `dev` (next dev), `build` (prisma generate + next build), `start`, `lint`, `seed`
- **Prisma:** seed configurado como `npx tsx prisma/seed.ts`
- **Dependencias clave:** next@16.2.3, react@19.2.4, @prisma/client@7.7.0, jose@6.2.3, bcryptjs@3.0.3, zod@4.4.3, lucide-react@1.14.0, tailwindcss@4

### `frontend/next.config.ts`
Configuración mínima de Next.js (objeto vacío).

### `frontend/tsconfig.json`
Configuración TypeScript estricta con `@/*` apuntando a `src/*`.

### `frontend/postcss.config.mjs`
PostCSS con plugin `@tailwindcss/postcss`.

### `frontend/prisma.config.ts`
Define schema path, migrations path y datasource URL para la CLI de Prisma.

### `package.json` (raíz)
Orquestador del monorepo con script `dev` y dependencia `concurrently`. Incluye `@google/generative-ai` como dependencia (no usado actualmente).

### `vercel.json`
Configura Vercel para usar el framework Next.js.

### `frontend/.env` / `.env.local`
Variables de entorno:
- `DATABASE_URL`: conexión Supabase vía pgBouncer
- `DIRECT_URL`: conexión directa a Supabase (para migraciones)
- `OPENROUTER_API_KEY`: clave para API de OpenRouter
- `JWT_SECRET`: secreto para firmar tokens JWT

---

*Documentación generada a partir del análisis completo del código fuente de TutoresOnLine.*

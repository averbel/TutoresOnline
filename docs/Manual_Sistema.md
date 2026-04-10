# Manual de Sistema - Arquitectura Técnica de TutoresOn-Line

Acorde a las buenas prácticas y principios de ingeniería de software, este documento estipula la forma de configurar y desplegar la plataforma.

## Requisitos Previos e Instalaciones
- **Node.js** v18+ o superior.
- **PostgreSQL** v14+.
- Gestor de paquetes: `npm`.

## Organización del Proyecto
El ecosistema implementa patrones divididos en dos repositorios / carpetas:

### 1. Aplicación Cliente / UI (Carpeta `frontend/`)
Desarrollado en **Next.js (App Router)** usando Vanilla CSS y estilos nativos HSL (sin Tailwind).
* **Directorio de páginas**: `src/app/`
* **Estilos Globales**: El archivo `globals.css` contiene las clases utilitarias basadas en gradientes, glassmorphism e inyecciones de variables HSL.
* Despliegue: `npm run build && npm start`.

### 2. Capa Servidor / API (Carpeta `backend/`)
Implementado con **Node.js, Express y TypeScript** utilizando una **Arquitectura Hexagonal (Puertos y Adaptadores)**.
* `/domain`: Las entidades centrales como `Usuario.ts` o reglas del objeto core.
* `/application`: Casos de uso (Servicios).
* `/infrastructure`: Rutas y adaptadores (Controllers de Express) que cumplen los principios SOLID.

## Ejecución Local

### Paso a Paso Backend
1. Navegue por la terminal a `scratch/TutoresOnLine/backend`.
2. Ejecute `npm install`.
3. Inicie el entorno con `npm run dev` (Asegurese de tener el puerto 4000 libre).
4. El servidor REST montará sus endpoints principales en `http://localhost:4000/api/...`.

### Paso a Paso Frontend
1. Abra otra terminal y diríjase a `scratch/TutoresOnLine/frontend`.
2. Ejecute `npm install` si hay paquetes faltantes.
3. Inicie el servidor de desarrollo `npm run dev`.
4. Visualice la plataforma con interfaz gráfica navegando a `http://localhost:3000`.

## Buenas Prácticas Aplicadas (Clean Code & SOLID)
- **Principio de Responsabilidad Única (SRP):** Cada archivo en `domain` representa un solo contexto. Los Controladores solo parsean HTTP e invocan a los servicios.
- **Inversión de Dependencias (DIP):** Los servicios dependerán de interfaces (`IUsuarioRepository`) en lugar de implementaciones concretas de base de datos, facilitando el Testing y Desacoplamiento de la BBDD PostgreSQL.

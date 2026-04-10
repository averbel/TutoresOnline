# Diseño de Base de Datos - "TutoresOn-Line"

Este documento presenta la estructura informacional. Utilizaremos un esquema de **Base de Datos Relacional (PostgreSQL)** garantizando la estructura ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad), ideal para una dApp que maneja reservas de recursos (tiempo de tutores).

## Diagrama Entidad-Relación (MER)

```mermaid
erDiagram
    Usuario ||--o{ Tutor: "puede_ser"
    Usuario ||--o{ Estudiante: "puede_ser"
    Tutor ||--o{ Disponibilidad: "gestiona"
    Tutor ||--o{ TutorMateria: "imparte"
    Materia ||--o{ TutorMateria: "incluye"
    Estudiante ||--o{ Tutoria: "reserva"
    Tutor ||--o{ Tutoria: "brinda"
    Tutoria ||--o{ Resena: "recita"

    Usuario {
        uuid id PK
        string nombre_completo
        string email
        string password_hash
        string rol "ADMIN, TUTOR, ESTUDIANTE"
        string telefono
        datetime auth_token
    }

    Tutor {
        uuid usuario_id PK, FK
        text biografia
        decimal latitud "Calculado por Geocodificación"
        decimal longitud
        float reputacion_promedio "1.0 - 5.0"
        boolean activo_ahora_flash "Modo Uber"
    }

    Estudiante {
        uuid usuario_id PK, FK
        string grado_academico
    }

    Materia {
        uuid id PK
        string nombre "Ej. Calculo I"
        string nivel_educativo "Primaria, Secundaria, Universitaria"
    }

    TutorMateria {
        uuid tutor_id FK
        uuid materia_id FK
        decimal tarifa_por_hora
    }

    Disponibilidad {
        uuid id PK
        uuid tutor_id FK
        int dia_semana "0 al 6"
        time hora_inicio
        time hora_fin
    }

    Tutoria {
        uuid id PK
        uuid estudiante_id FK
        uuid tutor_id FK
        uuid materia_id FK
        datetime fecha_inicio
        datetime fecha_fin
        string estado "PENDIENTE, ACEPTADA, RECHAZADA, COMPLETADA, CANCELADA"
        string modalidad "VIRTUAL, PRESENCIAL"
        string url_encuentro
        text notas_ia_generadas "Resumen de IA preparativo"
    }

    Resena {
        uuid id PK
        uuid tutoria_id FK
        int calificacion_estrellas "1 a 5"
        text feedback
    }
```

## Justificación Técnicas Clave
1. **Delegación de Autenticación (`Usuario` como entidad ancla):** Evita la duplicación de manejo de Login si alguien es ambos: Estudiante y a la vez Tutor.
2. **Disponibilidad por Franjas:** Permite escalabilidad al momento de hacer búsquedas eficientes en bases de datos con cláusulas granulares sobre el reloj con precisión militar.
3. **Puntuación pre-calulada:** En `Tutor.reputacion_promedio` guardaremos una copia pre calculada mediante un Trigger/Job del sistema para evitar cálculos lentos al buscar profesores velozmente en la vista.

export interface Usuario {
    id: string;
    nombreCompleto: string;
    email: string;
    rol: 'ADMIN' | 'TUTOR' | 'ESTUDIANTE';
    fechaRegistro: Date;
}

/** Entidad del dominio. Mismos campos que domain/motorcycle/motorcycle.model.ts del frontend. */
export interface Moto {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  categoria: string;
  cilindrada: number;
  potencia: number;
  torque: number;
  precio: number;
  imagen: string;
  descripcion: string;
}

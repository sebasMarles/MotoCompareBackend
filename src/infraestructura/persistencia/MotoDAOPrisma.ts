import type { PrismaClient } from "./generado/client";
import type { MotoModel as FilaMoto } from "./generado/models";
import type { Moto } from "../../dominio/modelo/Moto";
import type { FiltrosMoto, MotoDAO } from "../../dominio/puertos";

const aDominio = (fila: FilaMoto): Moto => ({
  id: fila.id,
  marca: fila.marca,
  modelo: fila.modelo,
  anio: fila.anio,
  categoria: fila.categoria,
  cilindrada: fila.cilindrada,
  potencia: fila.potencia,
  torque: fila.torque,
  precio: fila.precio,
  imagen: fila.imagen,
  descripcion: fila.descripcion,
});

export class MotoDAOPrisma implements MotoDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async listar(filtros: FiltrosMoto = {}): Promise<Moto[]> {
    const filas = await this.prisma.moto.findMany({
      where: {
        marca: filtros.marca,
        categoria: filtros.categoria,
      },
    });
    return filas.map(aDominio);
  }

  async porId(id: string): Promise<Moto | null> {
    const fila = await this.prisma.moto.findUnique({ where: { id } });
    return fila && aDominio(fila);
  }
}

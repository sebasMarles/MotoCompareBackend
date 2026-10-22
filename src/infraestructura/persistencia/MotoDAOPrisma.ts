import type { PrismaClient } from "./generado/client";
import type { MotoModel as FilaMoto } from "./generado/models";
import type { Moto } from "../../dominio/modelo/Moto";
import type { FiltrosMoto, MotoDAO, OrdenMoto } from "../../dominio/puertos";

const ORDEN_PRISMA: Record<OrdenMoto, { precio?: "asc" | "desc"; potencia?: "asc" | "desc" }> = {
  precio_asc: { precio: "asc" },
  precio_desc: { precio: "desc" },
  potencia_asc: { potencia: "asc" },
  potencia_desc: { potencia: "desc" },
};

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
    const where: {
      marca?: string;
      categoria?: string;
      precio?: { gte?: number; lte?: number };
      cilindrada?: { gte?: number; lte?: number };
      OR?: Array<
        { marca: { contains: string; mode: "insensitive" } } | { modelo: { contains: string; mode: "insensitive" } }
      >;
    } = {};
    if (filtros.marca !== undefined) where.marca = filtros.marca;
    if (filtros.categoria !== undefined) where.categoria = filtros.categoria;
    if (filtros.busqueda !== undefined) {
      where.OR = [
        { marca: { contains: filtros.busqueda, mode: "insensitive" } },
        { modelo: { contains: filtros.busqueda, mode: "insensitive" } },
      ];
    }
    if (filtros.precioMin !== undefined || filtros.precioMax !== undefined) {
      where.precio = {
        ...(filtros.precioMin !== undefined ? { gte: filtros.precioMin } : {}),
        ...(filtros.precioMax !== undefined ? { lte: filtros.precioMax } : {}),
      };
    }
    if (filtros.cilindradaMin !== undefined || filtros.cilindradaMax !== undefined) {
      where.cilindrada = {
        ...(filtros.cilindradaMin !== undefined ? { gte: filtros.cilindradaMin } : {}),
        ...(filtros.cilindradaMax !== undefined ? { lte: filtros.cilindradaMax } : {}),
      };
    }

    const limite = filtros.limite;
    const pagina = filtros.pagina ?? 1;

    const filas = await this.prisma.moto.findMany({
      where,
      ...(limite !== undefined ? { take: limite, skip: (pagina - 1) * limite } : {}),
      ...(filtros.orden !== undefined ? { orderBy: ORDEN_PRISMA[filtros.orden] } : {}),
    });
    return filas.map(aDominio);
  }

  async porId(id: string): Promise<Moto | null> {
    const fila = await this.prisma.moto.findUnique({ where: { id } });
    return fila && aDominio(fila);
  }
}

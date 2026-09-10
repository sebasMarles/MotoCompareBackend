import type { MotoGuardadaDTO } from '../../dominio/modelo/MotoGuardada'
import type { MotoDAO, MotoGuardadaDAO } from '../../dominio/puertos'

export class ListarGarage {
  constructor(
    private readonly garage: MotoGuardadaDAO,
    private readonly motos: MotoDAO,
  ) {}

  async ejecutar(usuarioId: string): Promise<MotoGuardadaDTO[]> {
    const guardadas = await this.garage.listarPorUsuario(usuarioId)

    return Promise.all(
      guardadas.map(async (guardada) => {
        const moto = await this.motos.porId(guardada.motoId)
        // No debería pasar (la integridad referencial la garantiza la base), pero TypeScript no lo sabe.
        if (!moto) throw new Error(`Moto ${guardada.motoId} no encontrada para la moto guardada ${guardada.id}`)
        return {
          id: guardada.id,
          apodo: guardada.apodo,
          kilometrajeActual: guardada.kilometrajeActual,
          agregadaEn: guardada.agregadaEn,
          moto,
        }
      }),
    )
  }
}

// Raíz de composición: el único archivo que puede importarlo todo y hacer `new`
// de implementaciones concretas.
import { RegistrarUsuario } from './aplicacion/casos-uso/RegistrarUsuario'
import { IniciarSesion } from './aplicacion/casos-uso/IniciarSesion'
import { ListarMotos } from './aplicacion/casos-uso/ListarMotos'
import { ObtenerMotoPorId } from './aplicacion/casos-uso/ObtenerMotoPorId'
import { AgregarMotoAlGarage } from './aplicacion/casos-uso/AgregarMotoAlGarage'
import { ListarGarage } from './aplicacion/casos-uso/ListarGarage'
import { ActualizarKilometraje } from './aplicacion/casos-uso/ActualizarKilometraje'
import { EliminarMotoDelGarage } from './aplicacion/casos-uso/EliminarMotoDelGarage'
import { RegistrarMantenimiento } from './aplicacion/casos-uso/RegistrarMantenimiento'
import { ListarMantenimientos } from './aplicacion/casos-uso/ListarMantenimientos'
import { ConfigurarCostoMensual } from './aplicacion/casos-uso/ConfigurarCostoMensual'
import { ListarCostosMensuales } from './aplicacion/casos-uso/ListarCostosMensuales'
import { ListarComparacionesRecomendadas } from './aplicacion/casos-uso/ListarComparacionesRecomendadas'

import { prisma } from './infraestructura/persistencia/prisma'
import { UsuarioDAOPrisma } from './infraestructura/persistencia/UsuarioDAOPrisma'
import { MotoDAOPrisma } from './infraestructura/persistencia/MotoDAOPrisma'
import { MotoGuardadaDAOPrisma } from './infraestructura/persistencia/MotoGuardadaDAOPrisma'
import { RegistroMantenimientoDAOPrisma } from './infraestructura/persistencia/RegistroMantenimientoDAOPrisma'
import { CostoMensualDAOPrisma } from './infraestructura/persistencia/CostoMensualDAOPrisma'
import { ComparacionRecomendadaDAOPrisma } from './infraestructura/persistencia/ComparacionRecomendadaDAOPrisma'
import { ClavesBcrypt } from './infraestructura/seguridad/ClavesBcrypt'
import { TokensJwt } from './infraestructura/seguridad/TokensJwt'
import { crearServidor } from './infraestructura/http/servidor'

const secreto = process.env['JWT_SECRET']
if (!secreto) throw new Error('Falta JWT_SECRET (copia .env.example a .env)')

// Adaptadores de persistencia — todos sobre el mismo cliente de Prisma.
const usuarios = new UsuarioDAOPrisma(prisma)
const motos = new MotoDAOPrisma(prisma)
const garage = new MotoGuardadaDAOPrisma(prisma)
const mantenimientos = new RegistroMantenimientoDAOPrisma(prisma)
const costos = new CostoMensualDAOPrisma(prisma)
const comparaciones = new ComparacionRecomendadaDAOPrisma(prisma)

// Adaptadores de seguridad.
const claves = new ClavesBcrypt()
const tokens = new TokensJwt(secreto)

// Casos de uso — cada uno recibe solo los puertos que necesita, nunca el adaptador concreto.
const app = crearServidor({
  usuarios,
  tokens,
  registrarUsuario: new RegistrarUsuario(usuarios, claves),
  iniciarSesion: new IniciarSesion(usuarios, claves, tokens),
  listarMotos: new ListarMotos(motos),
  obtenerMotoPorId: new ObtenerMotoPorId(motos),
  listarComparacionesRecomendadas: new ListarComparacionesRecomendadas(comparaciones, motos),
  agregarMotoAlGarage: new AgregarMotoAlGarage(garage, motos),
  listarGarage: new ListarGarage(garage, motos),
  actualizarKilometraje: new ActualizarKilometraje(garage),
  eliminarMotoDelGarage: new EliminarMotoDelGarage(garage),
  registrarMantenimiento: new RegistrarMantenimiento(garage, mantenimientos),
  listarMantenimientos: new ListarMantenimientos(garage, mantenimientos),
  configurarCostoMensual: new ConfigurarCostoMensual(garage, costos),
  listarCostosMensuales: new ListarCostosMensuales(garage, costos),
})

const puerto = Number(process.env['PORT'] ?? 3002)
app.listen(puerto, () => console.log(`MotoCompare API escuchando en http://localhost:${puerto}/api`))

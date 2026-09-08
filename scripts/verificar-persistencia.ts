import { prisma } from '../src/infraestructura/persistencia/prisma'
import { UsuarioDAOPrisma } from '../src/infraestructura/persistencia/UsuarioDAOPrisma'
import { MotoDAOPrisma } from '../src/infraestructura/persistencia/MotoDAOPrisma'

async function main() {
  const usuarios = new UsuarioDAOPrisma(prisma)
  const motos = new MotoDAOPrisma(prisma)

  const usuario = await usuarios.guardar({
    nombre: 'Usuario de prueba',
    correo: 'prueba@motocompare.test',
    claveHash: 'hash-temporal',
    activo: true,
  })
  console.log('Usuario creado:', usuario)

  await prisma.moto.create({
    data: {
      marca: 'Yamaha',
      modelo: 'MT-07',
      anio: 2024,
      categoria: 'Naked',
      cilindrada: 689,
      potencia: 73.4,
      torque: 67,
      precio: 35000000,
      imagen: 'https://ejemplo.com/mt07.jpg',
      descripcion: 'Naked de dos cilindros, agil y accesible.',
    },
  })

  console.log('Todas las motos:', await motos.listar())
  console.log('Solo Yamaha:', await motos.listar({ marca: 'Yamaha' }))

  await prisma.usuario.delete({ where: { id: usuario.id } })
  await prisma.moto.deleteMany({})
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

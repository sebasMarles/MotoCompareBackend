// Script de siembra: carga datos de ejemplo para poder probar el catálogo, el garage
// y las comparaciones recomendadas sin crearlos a mano uno por uno. Corre con: npm run db:seed
//
// Los valores de potencia/torque/cilindrada son reales (o muy cercanos) de cada moto;
// precio e imagen son de referencia — ajústalos para que calcen con
// infrastructure/motorcycle/mock-motorcycle.data.ts del frontend, así el catálogo se ve
// igual en ambos lados mientras no estén conectados de verdad.
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/infraestructura/persistencia/generado/client'

const connectionString = process.env['DATABASE_URL']
if (!connectionString) throw new Error('Falta DATABASE_URL (copia .env.example a .env)')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const motos = [
  { marca: 'Yamaha', modelo: 'MT-07', anio: 2024, categoria: 'Naked', cilindrada: 689, potencia: 73.4, torque: 67, precio: 35000000, imagen: 'https://ejemplo.com/mt07.jpg', descripcion: 'Naked de dos cilindros, ágil y accesible.' },
  { marca: 'Kawasaki', modelo: 'Z650', anio: 2024, categoria: 'Naked', cilindrada: 649, potencia: 67, torque: 64, precio: 38000000, imagen: 'https://ejemplo.com/z650.jpg', descripcion: 'Naked equilibrada, fácil de manejar en ciudad y carretera.' },
  { marca: 'Honda', modelo: 'CB500F', anio: 2024, categoria: 'Naked', cilindrada: 471, potencia: 47, torque: 43, precio: 28000000, imagen: 'https://ejemplo.com/cb500f.jpg', descripcion: 'Naked liviana, ideal para principiantes.' },
  { marca: 'BMW', modelo: 'G 310 GS', anio: 2024, categoria: 'Adventure', cilindrada: 313, potencia: 34, torque: 28, precio: 32000000, imagen: 'https://ejemplo.com/g310gs.jpg', descripcion: 'Adventure pequeña, versátil entre asfalto y destapado.' },
  { marca: 'KTM', modelo: '390 Adventure', anio: 2024, categoria: 'Adventure', cilindrada: 373, potencia: 43, torque: 37, precio: 30000000, imagen: 'https://ejemplo.com/390adventure.jpg', descripcion: 'Adventure deportiva, electrónica avanzada para su categoría.' },
  { marca: 'Suzuki', modelo: 'Gixxer SF250', anio: 2024, categoria: 'Deportiva', cilindrada: 249, potencia: 26, torque: 22, precio: 18000000, imagen: 'https://ejemplo.com/gixxer250.jpg', descripcion: 'Deportiva de entrada, carenado completo.' },
]

async function main() {
  console.log('Sembrando motos...')
  const creadas = await Promise.all(motos.map((moto) => prisma.moto.create({ data: moto })))
  console.log(`${creadas.length} motos creadas.`)

  const mt07 = creadas.find((m) => m.modelo === 'MT-07')!
  const z650 = creadas.find((m) => m.modelo === 'Z650')!

  await prisma.comparacionRecomendada.create({
    data: { titulo: 'Yamaha MT-07 vs Kawasaki Z650', motoAId: mt07.id, motoBId: z650.id },
  })
  console.log('Comparación recomendada creada.')

  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})

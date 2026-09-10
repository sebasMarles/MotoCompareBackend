// Prueba el flujo completo de autenticación contra un servidor real (`npm run dev`
// debe estar corriendo aparte). No usa las capas directamente: pasa por HTTP, como
// lo haría el frontend, para probar de verdad los endpoints y el middleware.
import { prisma } from '../src/infraestructura/persistencia/prisma'

const base = `http://localhost:${process.env['PORT'] ?? 3002}/api`
const correo = `verificacion.auth+${Date.now()}@motocompare.test`
const clave = 'clave-super-segura-123'

function afirmar(condicion: boolean, mensaje: string) {
  if (!condicion) throw new Error(`FALLÓ: ${mensaje}`)
  console.log(`OK: ${mensaje}`)
}

async function main() {
  // 1. Registro
  const registro = await fetch(`${base}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Usuario de Verificación', correo, clave }),
  })
  const usuarioRegistrado = await registro.json()
  afirmar(registro.status === 201, 'registro devuelve 201')
  afirmar(!('claveHash' in usuarioRegistrado), 'la respuesta del registro no expone claveHash')

  // 2. Registro duplicado
  const duplicado = await fetch(`${base}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Otra Vez', correo, clave }),
  })
  afirmar(duplicado.status === 409, 'registrar el mismo correo dos veces devuelve 409')

  // 3. Login con clave incorrecta
  const loginMalo = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, clave: 'clave-equivocada' }),
  })
  afirmar(loginMalo.status === 401, 'login con clave incorrecta devuelve 401')

  // 4. Login correcto
  const login = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, clave }),
  })
  afirmar(login.status === 200, 'login correcto devuelve 200')
  const sesion = (await login.json()) as { token: string }
  afirmar(typeof sesion.token === 'string' && sesion.token.length > 0, 'login devuelve un token')

  // 5. Perfil sin token
  const perfilSinToken = await fetch(`${base}/auth/perfil`)
  afirmar(perfilSinToken.status === 401, 'acceder a /perfil sin token devuelve 401')

  // 6. Perfil con token válido
  const perfilConToken = await fetch(`${base}/auth/perfil`, {
    headers: { Authorization: `Bearer ${sesion.token}` },
  })
  afirmar(perfilConToken.status === 200, 'acceder a /perfil con token devuelve 200')

  // 7. Logout
  const logout = await fetch(`${base}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sesion.token}` },
  })
  afirmar(logout.status === 204, 'logout devuelve 204')

  // 8. El mismo token ya no sirve después del logout (prueba real de revocación)
  const perfilTrasLogout = await fetch(`${base}/auth/perfil`, {
    headers: { Authorization: `Bearer ${sesion.token}` },
  })
  afirmar(perfilTrasLogout.status === 401, 'el token usado sigue rechazado después del logout')

  console.log('\nTodo el flujo de autenticación funciona correctamente.')

  // Limpieza: solo el usuario de prueba, nada más.
  await prisma.usuario.delete({ where: { correo } })
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

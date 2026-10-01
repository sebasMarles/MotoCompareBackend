import path from 'node:path'
import swaggerJsdoc from 'swagger-jsdoc'

// Especificación OpenAPI armada a partir de los comentarios @openapi que están
// arriba de cada ruta en infraestructura/http/rutas/*.ts — documentar un
// endpoint nuevo es agregar ese bloque ahí, no acá.
const definition = {
  openapi: '3.0.0',
  info: {
    title: 'MotoCompare API',
    version: '1.0.0',
    description: `API REST de MotoCompareBackend: catálogo de motos, autenticación y Mi Garage (motos guardadas, mantenimiento y costos mensuales).

### Rutas disponibles

| Método | Ruta |
| --- | --- |
| GET | /salud |
| POST | /auth/registro |
| POST | /auth/login |
| GET | /auth/perfil |
| POST | /auth/logout |
| GET | /motos |
| GET | /motos/comparaciones-recomendadas |
| GET | /motos/{id} |
| GET | /garage |
| POST | /garage |
| PATCH | /garage/{id}/kilometraje |
| DELETE | /garage/{id} |
| GET | /garage/{motoGuardadaId}/mantenimientos |
| POST | /garage/{motoGuardadaId}/mantenimientos |
| GET | /garage/{motoGuardadaId}/costos |
| POST | /garage/{motoGuardadaId}/costos |

Todas, salvo /salud, /auth/registro, /auth/login, /motos, /motos/comparaciones-recomendadas y /motos/{id}, requieren el header \`Authorization: Bearer <token>\` (botón "Authorize" arriba).`,
  },
  servers: [{ url: '/api', description: 'Servidor actual' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nombre: { type: 'string' },
          correo: { type: 'string' },
          creadoEn: { type: 'string', format: 'date-time' },
        },
      },
      RegistroInput: {
        type: 'object',
        required: ['nombre', 'correo', 'clave'],
        properties: {
          nombre: { type: 'string', example: 'Sebastián Marlés' },
          correo: { type: 'string', example: 'sebas@example.com' },
          clave: { type: 'string', format: 'password', example: 'claveSegura123' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['correo', 'clave'],
        properties: {
          correo: { type: 'string' },
          clave: { type: 'string', format: 'password' },
        },
      },
      SesionDTO: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          usuario: { $ref: '#/components/schemas/Usuario' },
        },
      },
      Moto: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          marca: { type: 'string' },
          modelo: { type: 'string' },
          anio: { type: 'integer' },
          categoria: { type: 'string' },
          cilindrada: { type: 'number' },
          potencia: { type: 'number' },
          torque: { type: 'number' },
          precio: { type: 'number' },
          imagen: { type: 'string' },
          descripcion: { type: 'string' },
        },
      },
      ComparacionRecomendadaDTO: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          titulo: { type: 'string' },
          motoA: { $ref: '#/components/schemas/Moto' },
          motoB: { $ref: '#/components/schemas/Moto' },
        },
      },
      MotoGuardada: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          apodo: { type: 'string', nullable: true },
          kilometrajeActual: { type: 'number' },
          agregadaEn: { type: 'string', format: 'date-time' },
          usuarioId: { type: 'string' },
          motoId: { type: 'string' },
        },
      },
      MotoGuardadaDTO: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          apodo: { type: 'string', nullable: true },
          kilometrajeActual: { type: 'number' },
          agregadaEn: { type: 'string', format: 'date-time' },
          moto: { $ref: '#/components/schemas/Moto' },
        },
      },
      AgregarMotoInput: {
        type: 'object',
        required: ['motoId'],
        properties: {
          motoId: { type: 'string' },
          apodo: { type: 'string' },
        },
      },
      ActualizarKilometrajeInput: {
        type: 'object',
        required: ['kilometrajeActual'],
        properties: { kilometrajeActual: { type: 'number' } },
      },
      RegistroMantenimiento: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          tipo: {
            type: 'string',
            enum: ['CAMBIO_ACEITE', 'PASTILLAS_FRENO', 'LLANTAS', 'REVISION_GENERAL', 'OTRO'],
          },
          fecha: { type: 'string', format: 'date-time' },
          kilometraje: { type: 'number' },
          costo: { type: 'number' },
          notas: { type: 'string', nullable: true },
          motoGuardadaId: { type: 'string' },
        },
      },
      NuevoMantenimientoInput: {
        type: 'object',
        required: ['tipo', 'kilometraje', 'costo'],
        properties: {
          tipo: {
            type: 'string',
            enum: ['CAMBIO_ACEITE', 'PASTILLAS_FRENO', 'LLANTAS', 'REVISION_GENERAL', 'OTRO'],
          },
          fecha: { type: 'string', format: 'date-time' },
          kilometraje: { type: 'number' },
          costo: { type: 'number' },
          notas: { type: 'string' },
        },
      },
      CostoMensual: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          categoria: { type: 'string', enum: ['COMBUSTIBLE', 'SEGURO', 'REPUESTOS', 'OTRO'] },
          descripcion: { type: 'string', nullable: true },
          monto: { type: 'number' },
          motoGuardadaId: { type: 'string' },
        },
      },
      NuevoCostoInput: {
        type: 'object',
        required: ['categoria', 'monto'],
        properties: {
          categoria: { type: 'string', enum: ['COMBUSTIBLE', 'SEGURO', 'REPUESTOS', 'OTRO'] },
          monto: { type: 'number' },
          descripcion: { type: 'string' },
        },
      },
      ResumenCostosDTO: {
        type: 'object',
        properties: {
          costos: { type: 'array', items: { $ref: '#/components/schemas/CostoMensual' } },
          totalMensual: { type: 'number' },
          salarioIdeal: { type: 'number' },
        },
      },
    },
  },
}

const options = {
  definition,
  // Dos extensiones porque `npm run dev` corre los .ts directo con tsx,
  // pero `npm run build` + `npm start` corren los .js ya compilados en dist/.
  // servidor.ts entra también, porque ahí vive la ruta /salud.
  apis: [
    path.join(__dirname, 'rutas', '*.ts'),
    path.join(__dirname, 'rutas', '*.js'),
    path.join(__dirname, 'servidor.ts'),
    path.join(__dirname, 'servidor.js'),
  ],
}

export const swaggerSpec = swaggerJsdoc(options)

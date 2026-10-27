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

Todas, salvo /salud, /auth/registro, /auth/login, /motos, /motos/comparaciones-recomendadas y /motos/{id}, requieren el header \`Authorization: Bearer <token>\` (botón "Authorize" arriba).`,
  },
  servers: [{ url: '/api', description: 'Servidor actual' }],
  // Orden en que aparecen las secciones en Swagger UI (si no, sale en el orden en que se leen los archivos).
  tags: [
    { name: 'Sistema' },
    { name: 'Autenticación' },
    { name: 'Motos' },
    { name: 'Garage' },
    { name: 'Mantenimiento' },
    { name: 'Costos' },
  ],
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

// swagger-jsdoc usa `glob` por debajo para resolver estos patrones, y `glob`
// interpreta `\\` como caracter de escape. En Windows, `path.join` devuelve
// rutas con `\\` (ej. `...\\rutas\\*.ts`), lo que rompe el comodín `*` y hace
// que esos archivos nunca se lean (por eso solo aparecía /salud, que no usa
// comodín). Se normaliza todo a `/` para que funcione igual en Windows y Linux.
const rutaGlob = (...segmentos: string[]): string =>
  path.join(__dirname, ...segmentos).split(path.sep).join('/')

const options = {
  definition,
  // Dos extensiones porque `npm run dev` corre los .ts directo con tsx,
  // pero `npm run build` + `npm start` corren los .js ya compilados en dist/.
  // servidor.ts entra también, porque ahí vive la ruta /salud.
  apis: [
    rutaGlob('rutas', '*.ts'),
    rutaGlob('rutas', '*.js'),
    rutaGlob('servidor.ts'),
    rutaGlob('servidor.js'),
  ],
}

export const swaggerSpec = swaggerJsdoc(options)

// Tema oscuro para la UI de /api-docs (swagger-ui-express no trae uno
// propio: esto es CSS inyectado sobre sus clases estándar).
const swaggerUiCustomCss = `
  body { background-color: #1b1b1b; }
  .swagger-ui { background-color: #1b1b1b; }
  .swagger-ui .topbar { background-color: #141414; border-bottom: 1px solid #2a2a2a; }
  .swagger-ui .topbar .download-url-wrapper { display: none; }
  .swagger-ui .info .title,
  .swagger-ui .info h1, .swagger-ui .info h2, .swagger-ui .info h3,
  .swagger-ui .info h4, .swagger-ui .info h5,
  .swagger-ui .opblock-tag,
  .swagger-ui .opblock .opblock-summary-operation-id,
  .swagger-ui .opblock .opblock-summary-path,
  .swagger-ui .scheme-container,
  .swagger-ui .model-title,
  .swagger-ui table thead tr td,
  .swagger-ui table thead tr th,
  .swagger-ui .parameter__name,
  .swagger-ui .response-col_status,
  .swagger-ui label { color: #e8e8e8; }
  .swagger-ui .info .description,
  .swagger-ui .info p,
  .swagger-ui .opblock .opblock-summary-description,
  .swagger-ui .parameter__type,
  .swagger-ui .response-col_description,
  .swagger-ui .model { color: #b0b0b0; }
  .swagger-ui .scheme-container { background-color: #1b1b1b; box-shadow: none; border-bottom: 1px solid #2a2a2a; }
  .swagger-ui select,
  .swagger-ui input[type=text],
  .swagger-ui input[type=password],
  .swagger-ui input[type=email],
  .swagger-ui textarea { background-color: #141414; color: #e8e8e8; border: 1px solid #3a3a3a; }
  .swagger-ui .opblock-tag { border-bottom: 1px solid #2a2a2a; }
  .swagger-ui .opblock-tag:hover { background-color: #202020; }
  .swagger-ui .opblock { border: none; box-shadow: none; margin-bottom: 8px; border-radius: 4px; }
  .swagger-ui .opblock .opblock-summary { border: none; }
  .swagger-ui .opblock .opblock-summary-method { color: #12151a; font-weight: bold; }
  .swagger-ui .opblock.opblock-get { background: #16233a; }
  .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #4990e2; }
  .swagger-ui .opblock.opblock-post { background: #0f2e22; }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #22c58b; }
  .swagger-ui .opblock.opblock-patch { background: #19303a; }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #4fd1c5; }
  .swagger-ui .opblock.opblock-delete { background: #341418; }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4b4b; }
  .swagger-ui section.models { background: #161b22; border: 1px solid #2a2a2a; }
  .swagger-ui section.models.is-open h4 { border-bottom: 1px solid #2a2a2a; }
  .swagger-ui .model-box { background: #161b22; }
  .swagger-ui .btn { background: #202020; color: #e8e8e8; border-color: #3a3a3a; }
  .swagger-ui .btn.authorize { background: #161b22; color: #4fd1c5; border-color: #4fd1c5; }
  .swagger-ui .btn.authorize svg { fill: #4fd1c5; }
  .swagger-ui svg { fill: #e8e8e8; }
`

export const swaggerUiOptions = {
  customCss: swaggerUiCustomCss,
  customSiteTitle: 'MotoCompare API Docs',
}

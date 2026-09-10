-- CreateEnum
CREATE TYPE "TipoMantenimiento" AS ENUM ('CAMBIO_ACEITE', 'PASTILLAS_FRENO', 'LLANTAS', 'REVISION_GENERAL', 'OTRO');

-- CreateEnum
CREATE TYPE "CategoriaCosto" AS ENUM ('COMBUSTIBLE', 'SEGURO', 'REPUESTOS', 'OTRO');

-- CreateTable
CREATE TABLE "MotoGuardada" (
    "id" TEXT NOT NULL,
    "apodo" TEXT,
    "kilometrajeActual" INTEGER NOT NULL DEFAULT 0,
    "agregadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "motoId" TEXT NOT NULL,

    CONSTRAINT "MotoGuardada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroMantenimiento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMantenimiento" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "kilometraje" INTEGER NOT NULL,
    "costo" INTEGER NOT NULL,
    "notas" TEXT,
    "motoGuardadaId" TEXT NOT NULL,

    CONSTRAINT "RegistroMantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostoMensual" (
    "id" TEXT NOT NULL,
    "categoria" "CategoriaCosto" NOT NULL,
    "descripcion" TEXT,
    "monto" INTEGER NOT NULL,
    "motoGuardadaId" TEXT NOT NULL,

    CONSTRAINT "CostoMensual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComparacionRecomendada" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "destacada" BOOLEAN NOT NULL DEFAULT true,
    "motoAId" TEXT NOT NULL,
    "motoBId" TEXT NOT NULL,

    CONSTRAINT "ComparacionRecomendada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MotoGuardada_usuarioId_idx" ON "MotoGuardada"("usuarioId");

-- CreateIndex
CREATE INDEX "RegistroMantenimiento_motoGuardadaId_idx" ON "RegistroMantenimiento"("motoGuardadaId");

-- CreateIndex
CREATE INDEX "CostoMensual_motoGuardadaId_idx" ON "CostoMensual"("motoGuardadaId");

-- AddForeignKey
ALTER TABLE "MotoGuardada" ADD CONSTRAINT "MotoGuardada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotoGuardada" ADD CONSTRAINT "MotoGuardada_motoId_fkey" FOREIGN KEY ("motoId") REFERENCES "Moto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroMantenimiento" ADD CONSTRAINT "RegistroMantenimiento_motoGuardadaId_fkey" FOREIGN KEY ("motoGuardadaId") REFERENCES "MotoGuardada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostoMensual" ADD CONSTRAINT "CostoMensual_motoGuardadaId_fkey" FOREIGN KEY ("motoGuardadaId") REFERENCES "MotoGuardada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparacionRecomendada" ADD CONSTRAINT "ComparacionRecomendada_motoAId_fkey" FOREIGN KEY ("motoAId") REFERENCES "Moto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparacionRecomendada" ADD CONSTRAINT "ComparacionRecomendada_motoBId_fkey" FOREIGN KEY ("motoBId") REFERENCES "Moto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "SesionRevocada" (
    "jti" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "revocadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SesionRevocada_pkey" PRIMARY KEY ("jti")
);

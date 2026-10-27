-- CreateTable
CREATE TABLE "CierreGlobalSesion" (
    "usuarioId" TEXT NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CierreGlobalSesion_pkey" PRIMARY KEY ("usuarioId")
);

-- AddForeignKey
ALTER TABLE "CierreGlobalSesion" ADD CONSTRAINT "CierreGlobalSesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

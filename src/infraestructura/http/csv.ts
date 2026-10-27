import type { RegistroMantenimiento } from '../../dominio/modelo/RegistroMantenimiento'

// Formato de exportación del historial de mantenimiento. Es un asunto de presentación
// (cómo se le entrega el dato al usuario), por eso vive en la capa HTTP y no en el dominio.

export type SeparadorCsv = ',' | ';'

export function esSeparadorCsv(valor: unknown): valor is SeparadorCsv {
  return valor === ',' || valor === ';'
}

const ENCABEZADOS = ['fecha', 'tipo', 'kilometraje', 'costo', 'notas'] as const

// Excel interpreta como fórmula una celda que empieza por = + - @ (inyección CSV);
// se antepone un apóstrofo para que se muestre como texto plano.
function neutralizarFormula(texto: string): string {
  return /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto
}

function celda(valor: string | number, separador: SeparadorCsv): string {
  const texto = typeof valor === 'number' ? String(valor) : neutralizarFormula(valor)
  const requiereComillas = texto.includes(separador) || /["\r\n]/.test(texto)
  return requiereComillas ? `"${texto.replaceAll('"', '""')}"` : texto
}

/** Historial de mantenimiento en CSV (RFC 4180), del más antiguo al más reciente. */
export function mantenimientosACsv(
  registros: readonly RegistroMantenimiento[],
  separador: SeparadorCsv = ',',
): string {
  const ordenados = [...registros].sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
  const filas = ordenados.map((registro) =>
    [registro.fecha.toISOString().slice(0, 10), registro.tipo, registro.kilometraje, registro.costo, registro.notas ?? '']
      .map((valor) => celda(valor, separador))
      .join(separador),
  )
  // El BOM inicial hace que Excel abra el archivo como UTF-8 (tildes y ñ en las notas).
  return '﻿' + [ENCABEZADOS.join(separador), ...filas].join('\r\n') + '\r\n'
}

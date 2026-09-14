import { saveAs } from 'file-saver';
import { z } from 'zod';
import { participanteSchema, gastoItemSchema } from '@/db/backupSchema';
import { crearEventoDesdeImportacionQr } from '@/db/repositorios/eventosCompartidos';
import type { EventoCompartido } from '@/types/models';

// Fallback para eventos que no entran en un QR: mismo mecanismo de
// archivo .json que el backup completo, pero con un solo evento.

const archivoEventoSchema = z.object({
  app: z.literal('organizador-local-first'),
  tipo: z.literal('evento-compartido'),
  exportadoEn: z.string(),
  evento: z.object({
    nombre: z.string().min(1),
    participantes: z.array(participanteSchema),
    gastos: z.array(gastoItemSchema),
  }),
});

export async function exportarEventoComoArchivo(evento: EventoCompartido): Promise<void> {
  const payload = {
    app: 'organizador-local-first' as const,
    tipo: 'evento-compartido' as const,
    exportadoEn: new Date().toISOString(),
    evento: {
      nombre: evento.nombre,
      participantes: evento.participantes,
      gastos: evento.gastos,
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const nombreArchivo = evento.nombre.trim().toLowerCase().replace(/\s+/g, '-') || 'evento';
  saveAs(blob, `evento-${nombreArchivo}-${Date.now()}.json`);
}

/**
 * Igual que escanear un QR: rechaza el archivo entero si no valida, y
 * siempre crea un evento nuevo con ids remapeados (ver crearEventoDesdeImportacionQr).
 */
export async function importarEventoDesdeTexto(jsonTexto: string): Promise<EventoCompartido> {
  let crudo: unknown;
  try {
    crudo = JSON.parse(jsonTexto);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }

  const resultado = archivoEventoSchema.safeParse(crudo);
  if (!resultado.success) {
    throw new Error('El archivo no tiene el formato esperado de un evento compartido.');
  }

  return crearEventoDesdeImportacionQr(resultado.data.evento);
}

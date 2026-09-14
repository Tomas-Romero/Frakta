import { z } from 'zod';
import { participanteSchema, gastoItemSchema } from '@/db/backupSchema';

// Payload que viaja dentro del QR (y del archivo de fallback) al compartir un
// evento entre dispositivos, sin backend. `v` versiona este formato — es
// independiente de SCHEMA_VERSION_ACTUAL, que versiona el backup completo.
export const payloadQrEventoSchema = z.object({
  v: z.literal(1),
  tipo: z.literal('evento-compartido'),
  evento: z.object({
    nombre: z.string().min(1),
    participantes: z.array(participanteSchema),
    gastos: z.array(gastoItemSchema),
  }),
});

export type PayloadQrEventoValidado = z.infer<typeof payloadQrEventoSchema>;

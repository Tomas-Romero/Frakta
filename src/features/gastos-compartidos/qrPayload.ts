import LZString from 'lz-string';
import { payloadQrEventoSchema, type PayloadQrEventoValidado } from './qrPayloadSchema';
import type { EventoCompartido } from '@/types/models';

const VERSION_PAYLOAD_QR = 1;

// Techo empírico del texto base64 que entra en un QR legible con cámara de
// celular: nivel de corrección M y una versión moderada (~25-30, nunca la 40
// — a esa densidad el escaneo se vuelve poco confiable en la práctica). Ver
// docs/BLUEPRINT.md sección 8.
export const TECHO_BASE64_QR = 1500;

export function codificarEventoParaQr(evento: EventoCompartido): string {
  const payload: PayloadQrEventoValidado = {
    v: VERSION_PAYLOAD_QR,
    tipo: 'evento-compartido',
    evento: {
      nombre: evento.nombre,
      participantes: evento.participantes,
      gastos: evento.gastos,
    },
  };
  return LZString.compressToBase64(JSON.stringify(payload));
}

export function cabeEnQr(textoBase64: string): boolean {
  return textoBase64.length <= TECHO_BASE64_QR;
}

/**
 * Rechaza todo ante cualquier fallo de descompresión, parseo o validación —
 * nunca una importación parcial, misma filosofía que importarBackupDesdeTexto.
 */
export function decodificarPayloadQr(textoBase64: string): PayloadQrEventoValidado {
  const jsonTexto = LZString.decompressFromBase64(textoBase64);
  if (!jsonTexto) {
    throw new Error('El código no contiene un evento de Frakta válido.');
  }

  let crudo: unknown;
  try {
    crudo = JSON.parse(jsonTexto);
  } catch {
    throw new Error('El código no contiene un JSON válido.');
  }

  const resultado = payloadQrEventoSchema.safeParse(crudo);
  if (!resultado.success) {
    throw new Error('El código no tiene el formato esperado de un evento compartido.');
  }
  return resultado.data;
}

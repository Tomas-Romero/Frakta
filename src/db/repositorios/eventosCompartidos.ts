import { db } from '../db';
import type { EventoCompartido, GastoItem, Participante } from '../../types/models';

export async function crearEvento(nombre: string): Promise<EventoCompartido> {
  const evento: EventoCompartido = {
    id: crypto.randomUUID(),
    nombre,
    participantes: [],
    gastos: [],
  };
  await db.eventosCompartidos.add(evento);
  return evento;
}

export async function renombrarEvento(id: string, nombre: string): Promise<void> {
  await db.eventosCompartidos.update(id, { nombre });
}

export async function eliminarEvento(id: string): Promise<void> {
  await db.eventosCompartidos.delete(id);
}

export async function agregarParticipante(eventoId: string, nombre: string): Promise<void> {
  const evento = await db.eventosCompartidos.get(eventoId);
  if (!evento) return;
  const participante: Participante = { id: crypto.randomUUID(), nombre };
  await db.eventosCompartidos.update(eventoId, {
    participantes: [...evento.participantes, participante],
  });
}

/**
 * Saca al participante del evento y de la lista de pagadores/consumidores de
 * cada gasto donde figuraba — nunca deja un gasto apuntando a alguien inexistente.
 */
export async function eliminarParticipante(eventoId: string, participanteId: string): Promise<void> {
  const evento = await db.eventosCompartidos.get(eventoId);
  if (!evento) return;
  await db.eventosCompartidos.update(eventoId, {
    participantes: evento.participantes.filter((p) => p.id !== participanteId),
    gastos: evento.gastos.map((g) => ({
      ...g,
      pagadoPor: g.pagadoPor.filter((id) => id !== participanteId),
      participantes: g.participantes.filter((id) => id !== participanteId),
    })),
  });
}

export async function agregarGasto(
  eventoId: string,
  datos: Omit<GastoItem, 'id'>,
): Promise<void> {
  const evento = await db.eventosCompartidos.get(eventoId);
  if (!evento) return;
  const gasto: GastoItem = { ...datos, id: crypto.randomUUID() };
  await db.eventosCompartidos.update(eventoId, { gastos: [...evento.gastos, gasto] });
}

export async function actualizarGasto(
  eventoId: string,
  gastoId: string,
  cambios: Partial<Omit<GastoItem, 'id'>>,
): Promise<void> {
  const evento = await db.eventosCompartidos.get(eventoId);
  if (!evento) return;
  await db.eventosCompartidos.update(eventoId, {
    gastos: evento.gastos.map((g) => (g.id === gastoId ? { ...g, ...cambios } : g)),
  });
}

export async function eliminarGasto(eventoId: string, gastoId: string): Promise<void> {
  const evento = await db.eventosCompartidos.get(eventoId);
  if (!evento) return;
  await db.eventosCompartidos.update(eventoId, {
    gastos: evento.gastos.filter((g) => g.id !== gastoId),
  });
}

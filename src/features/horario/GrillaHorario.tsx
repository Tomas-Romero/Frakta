import {
  APERTURA_MIN,
  DIAS,
  ETIQUETA_DIA,
  SLOT_MIN,
  TOTAL_SLOTS,
  agruparPorDia,
  layoutDia,
  minutosATexto,
} from './layoutSemana';
import type { BloqueHorario, DiaSemana, Materia } from '@/types/models';

const ALTO_SLOT_PX = 24;
const ALTO_HEADER_PX = 36;

interface GrillaHorarioProps {
  bloques: BloqueHorario[];
  materiasPorId: Map<string, Materia>;
  onClickBloque: (bloque: BloqueHorario) => void;
  onClickCelda: (dia: DiaSemana, horaInicioMin: number) => void;
}

export function GrillaHorario({
  bloques,
  materiasPorId,
  onClickBloque,
  onClickCelda,
}: GrillaHorarioProps) {
  const bloquesPorDia = agruparPorDia(bloques);
  const horas = Array.from({ length: TOTAL_SLOTS / 2 }, (_, i) => APERTURA_MIN + i * 60);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div
        className="grid min-w-[820px]"
        style={{
          gridTemplateColumns: `56px repeat(${DIAS.length}, minmax(110px, 1fr))`,
          gridTemplateRows: `${ALTO_HEADER_PX}px repeat(${TOTAL_SLOTS}, ${ALTO_SLOT_PX}px)`,
        }}
      >
        <div className="sticky left-0 z-10 border-b bg-card" />
        {DIAS.map((dia, i) => (
          <div
            key={dia}
            className="flex items-center justify-center border-b border-l bg-card text-xs font-medium"
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            {ETIQUETA_DIA[dia]}
          </div>
        ))}

        {horas.map((horaMin, i) => (
          <div
            key={horaMin}
            className="sticky left-0 z-10 -translate-y-1/2 bg-card pr-2 text-right text-[11px] text-muted-foreground"
            style={{ gridColumn: 1, gridRow: `${2 + i * 2} / span 2` }}
          >
            {minutosATexto(horaMin)}
          </div>
        ))}

        {DIAS.map((dia, diaIndex) =>
          Array.from({ length: TOTAL_SLOTS }, (_, slotIndex) => (
            <button
              key={`${dia}-${slotIndex}`}
              type="button"
              className="border-b border-l hover:bg-accent/50"
              style={{ gridColumn: diaIndex + 2, gridRow: 2 + slotIndex }}
              onClick={() => onClickCelda(dia, APERTURA_MIN + slotIndex * SLOT_MIN)}
            />
          )),
        )}

        {DIAS.map((dia, diaIndex) => (
          <div
            key={`overlay-${dia}`}
            className="relative pointer-events-none"
            style={{ gridColumn: diaIndex + 2, gridRow: `2 / span ${TOTAL_SLOTS}` }}
          >
            {layoutDia(bloquesPorDia[dia]).map((b) => {
              const materia = materiasPorId.get(b.materiaId);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onClickBloque(b)}
                  className="pointer-events-auto absolute overflow-hidden rounded-md px-1.5 py-1 text-left text-[11px] leading-tight text-white shadow-sm transition-transform hover:z-10 hover:scale-[1.02]"
                  style={{
                    top: `${((b.filaInicio - 1) / TOTAL_SLOTS) * 100}%`,
                    height: `${(b.filaSpan / TOTAL_SLOTS) * 100}%`,
                    left: `${b.offsetPct}%`,
                    width: `calc(${b.anchoPct}% - 2px)`,
                    background: b.color,
                  }}
                >
                  <p className="truncate font-semibold">{materia?.nombre ?? '—'}</p>
                  <p className="truncate opacity-90">
                    {minutosATexto(b.horaInicioMin)}–{minutosATexto(b.horaFinMin)}
                    {b.aula ? ` · ${b.aula}` : ''}
                  </p>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

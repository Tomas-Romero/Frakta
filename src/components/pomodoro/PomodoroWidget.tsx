import { useEffect } from 'react';
import { Pause, Play, RotateCcw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePomodoroStore, DURACION_TRABAJO_SEG, DURACION_DESCANSO_SEG } from '@/store/pomodoroStore';
import { incrementarPomodoro } from '@/db/repositorios/tareas';

function formatearTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60)
    .toString()
    .padStart(2, '0');
  const s = (segundos % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function PomodoroWidget() {
  const {
    tareaActivaId,
    tituloTareaActiva,
    segundosRestantes,
    corriendo,
    modo,
    minimizado,
    iniciar,
    pausar,
    reiniciar,
    alternarMinimizado,
    cerrar,
  } = usePomodoroStore();

  // Tick del cronómetro: un intervalo real, desacoplado del render vía getState().
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => usePomodoroStore.getState().tick(), 1000);
    return () => clearInterval(id);
  }, [corriendo]);

  // Transición automática trabajo -> descanso (con incremento de pomodoro) o descanso -> trabajo.
  useEffect(() => {
    if (segundosRestantes !== 0) return;
    const estado = usePomodoroStore.getState();
    if (estado.modo === 'trabajo') {
      if (estado.tareaActivaId) void incrementarPomodoro(estado.tareaActivaId);
      usePomodoroStore.setState({ modo: 'descanso', segundosRestantes: DURACION_DESCANSO_SEG });
    } else {
      usePomodoroStore.setState({
        modo: 'trabajo',
        segundosRestantes: DURACION_TRABAJO_SEG,
        corriendo: false,
      });
    }
  }, [segundosRestantes]);

  if (!tareaActivaId) return null;

  const duracionTotal = modo === 'trabajo' ? DURACION_TRABAJO_SEG : DURACION_DESCANSO_SEG;
  const progreso = 1 - segundosRestantes / duracionTotal;

  return (
    <div className="fixed right-4 bottom-4 z-40 w-64 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-lg">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="truncate text-xs font-medium text-muted-foreground">
          {modo === 'trabajo' ? 'Enfoque' : 'Descanso'} · {tituloTareaActiva}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" onClick={alternarMinimizado}>
            {minimizado ? <ChevronUp /> : <ChevronDown />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={cerrar}>
            <X />
          </Button>
        </div>
      </div>

      {!minimizado && (
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="relative flex size-28 items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progreso)}
                strokeLinecap="round"
                className={modo === 'trabajo' ? 'text-primary' : 'text-emerald-500'}
              />
            </svg>
            <span className="text-2xl font-semibold tabular-nums">
              {formatearTiempo(segundosRestantes)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={reiniciar}>
              <RotateCcw />
            </Button>
            {corriendo ? (
              <Button size="sm" onClick={pausar}>
                <Pause /> Pausar
              </Button>
            ) : (
              <Button size="sm" onClick={iniciar}>
                <Play /> Iniciar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { create } from 'zustand';

// Estado del temporizador Pomodoro — efímero, de sesión, nunca persistido a
// Dexie (los datos de negocio son solo `pomodorosCompletados` en la Tarea).
// Ver docs/BLUEPRINT.md sección 5.

export const DURACION_TRABAJO_SEG = 25 * 60;
export const DURACION_DESCANSO_SEG = 5 * 60;

type ModoPomodoro = 'trabajo' | 'descanso';

interface PomodoroState {
  tareaActivaId: string | null;
  tituloTareaActiva: string | null;
  segundosRestantes: number;
  corriendo: boolean;
  modo: ModoPomodoro;
  minimizado: boolean;
  enfocarTarea: (id: string, titulo: string) => void;
  iniciar: () => void;
  pausar: () => void;
  reiniciar: () => void;
  alternarMinimizado: () => void;
  cerrar: () => void;
  tick: () => void;
  saltarAModo: (modo: ModoPomodoro) => void;
}

export const usePomodoroStore = create<PomodoroState>()((set, get) => ({
  tareaActivaId: null,
  tituloTareaActiva: null,
  segundosRestantes: DURACION_TRABAJO_SEG,
  corriendo: false,
  modo: 'trabajo',
  minimizado: false,

  enfocarTarea: (id, titulo) =>
    set({
      tareaActivaId: id,
      tituloTareaActiva: titulo,
      segundosRestantes: DURACION_TRABAJO_SEG,
      modo: 'trabajo',
      corriendo: false,
      minimizado: false,
    }),

  iniciar: () => set({ corriendo: true }),
  pausar: () => set({ corriendo: false }),

  reiniciar: () =>
    set({
      segundosRestantes: get().modo === 'trabajo' ? DURACION_TRABAJO_SEG : DURACION_DESCANSO_SEG,
      corriendo: false,
    }),

  alternarMinimizado: () => set((s) => ({ minimizado: !s.minimizado })),

  cerrar: () =>
    set({
      tareaActivaId: null,
      tituloTareaActiva: null,
      corriendo: false,
      modo: 'trabajo',
      segundosRestantes: DURACION_TRABAJO_SEG,
    }),

  saltarAModo: (modo) =>
    set({
      modo,
      segundosRestantes: modo === 'trabajo' ? DURACION_TRABAJO_SEG : DURACION_DESCANSO_SEG,
    }),

  tick: () => {
    const { segundosRestantes } = get();
    if (segundosRestantes > 0) {
      set({ segundosRestantes: segundosRestantes - 1 });
    }
  },
}));

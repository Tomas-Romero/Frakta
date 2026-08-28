import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTema, cambiarTema } from '@/hooks/useTema';
import type { ConfigApp } from '@/db/db';

const SIGUIENTE: Record<ConfigApp['tema'], ConfigApp['tema']> = {
  auto: 'claro',
  claro: 'oscuro',
  oscuro: 'auto',
};

const ICONO: Record<ConfigApp['tema'], typeof Sun> = {
  auto: Monitor,
  claro: Sun,
  oscuro: Moon,
};

const ETIQUETA: Record<ConfigApp['tema'], string> = {
  auto: 'Tema: automático (según el sistema)',
  claro: 'Tema: claro',
  oscuro: 'Tema: oscuro',
};

export function ThemeToggle() {
  const tema = useTema();
  const Icono = ICONO[tema];

  return (
    <Button
      variant="ghost"
      size="icon"
      title={`${ETIQUETA[tema]} — click para cambiar`}
      onClick={() => void cambiarTema(SIGUIENTE[tema])}
    >
      <Icono />
    </Button>
  );
}

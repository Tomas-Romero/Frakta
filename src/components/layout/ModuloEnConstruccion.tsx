interface ModuloEnConstruccionProps {
  titulo: string;
  fase: string;
}

export function ModuloEnConstruccion({ titulo, fase }: ModuloEnConstruccionProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-24 text-center text-muted-foreground">
      <p className="text-base font-medium text-foreground">{titulo}</p>
      <p className="text-sm">Se construye en {fase} — ver docs/ROADMAP.md.</p>
    </div>
  );
}

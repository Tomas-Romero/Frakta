import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ENCABEZADOS_CSV } from './csv';

export function CsvAyuda() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <HelpCircle />
          Formato del CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Formato esperado del CSV</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          <p>
            Delimitador <code className="rounded bg-muted px-1">;</code> (no coma) y números con
            coma decimal, formato Argentina — igual que exporta Excel en configuración regional
            Argentina.
          </p>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted">
                <tr>
                  {ENCABEZADOS_CSV.map((h) => (
                    <th key={h} className="px-2 py-1.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1.5">Análisis I</td>
                  <td className="px-2 py-1.5">1</td>
                  <td className="px-2 py-1.5">6</td>
                  <td className="px-2 py-1.5">90</td>
                  <td className="px-2 py-1.5">8,50</td>
                  <td className="px-2 py-1.5">Aprobado</td>
                  <td className="px-2 py-1.5">1</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="list-inside list-disc text-muted-foreground">
            <li>"Estado" debe ser exactamente PorCursar, Cursando, Regular o Aprobado.</li>
            <li>"Nota" puede quedar vacía si todavía no tenés una.</li>
            <li>"Peso final" queda en 1 si se deja vacío.</li>
            <li>
              Correlativas y parciales no se importan por CSV — se cargan después desde el
              formulario de cada materia.
            </li>
            <li>Un archivo con una fila inválida se rechaza entero: no se carga nada parcial.</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

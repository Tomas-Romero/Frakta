import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db, obtenerConfig } from '@/db/db';
import { formatNumeroAr } from '@/lib/numeroAr';
import { MateriasList } from './MateriasList';
import { MateriaForm } from './MateriaForm';
import { NotaNecesariaDialog } from './NotaNecesariaDialog';
import { CsvAyuda } from './CsvAyuda';
import { importarMateriasDesdeCsv, exportarMateriasComoCsv } from './csv';
import {
  promedioGeneral,
  promedioSinAplazos,
  porcentajeAvance,
  horasCompletadas,
} from './metricas';
import type { Materia } from '@/types/models';

type EstadoImportacion =
  | { tipo: 'inactivo' }
  | { tipo: 'exito'; mensaje: string }
  | { tipo: 'error'; mensaje: string };

export function Academico() {
  const materias = useLiveQuery(() => db.materias.toArray(), [], []);
  const config = useLiveQuery(() => obtenerConfig());
  const [formAbierto, setFormAbierto] = useState(false);
  const [materiaEditando, setMateriaEditando] = useState<Materia | undefined>(undefined);
  const [materiaCalculando, setMateriaCalculando] = useState<Materia | null>(null);
  const [estadoImportacion, setEstadoImportacion] = useState<EstadoImportacion>({
    tipo: 'inactivo',
  });
  const inputCsvRef = useRef<HTMLInputElement>(null);

  if (!materias || !config) return null;

  const escalaNotas = config.escalaNotas;

  function abrirNueva() {
    setMateriaEditando(undefined);
    setFormAbierto(true);
  }

  function abrirEdicion(materia: Materia) {
    setMateriaEditando(materia);
    setFormAbierto(true);
  }

  function exportarCsv() {
    const csv = exportarMateriasComoCsv(materias ?? []);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `materias-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importarCsv(archivo: File) {
    try {
      const texto = await archivo.text();
      const cantidad = await importarMateriasDesdeCsv(texto, escalaNotas);
      setEstadoImportacion({ tipo: 'exito', mensaje: `Se importaron ${cantidad} materias.` });
    } catch (error) {
      setEstadoImportacion({ tipo: 'error', mensaje: (error as Error).message });
    } finally {
      if (inputCsvRef.current) inputCsvRef.current.value = '';
    }
  }

  const pGeneral = promedioGeneral(materias);
  const pSinAplazos = promedioSinAplazos(materias, escalaNotas);
  const avance = porcentajeAvance(materias);
  const horas = horasCompletadas(materias);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Promedio general</CardDescription>
            <CardTitle className="text-2xl">
              {pGeneral === null ? '—' : formatNumeroAr(Math.round(pGeneral * 100) / 100)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Promedio sin aplazos</CardDescription>
            <CardTitle className="text-2xl">
              {pSinAplazos === null ? '—' : formatNumeroAr(Math.round(pSinAplazos * 100) / 100)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avance de la carrera</CardDescription>
            <CardTitle className="text-2xl">{formatNumeroAr(Math.round(avance))}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Horas completadas</CardDescription>
            <CardTitle className="text-2xl">{formatNumeroAr(horas)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={abrirNueva}>
          <Plus /> Nueva materia
        </Button>
        <Button variant="outline" onClick={() => inputCsvRef.current?.click()}>
          <Upload /> Importar CSV
        </Button>
        <Button variant="outline" onClick={exportarCsv} disabled={materias.length === 0}>
          <Download /> Exportar CSV
        </Button>
        <CsvAyuda />
        <input
          ref={inputCsvRef}
          type="file"
          accept="text/csv,.csv"
          className="hidden"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (archivo) void importarCsv(archivo);
          }}
        />
      </div>

      {estadoImportacion.tipo === 'exito' && (
        <p className="rounded-md border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          {estadoImportacion.mensaje}
        </p>
      )}
      {estadoImportacion.tipo === 'error' && (
        <p className="whitespace-pre-line rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {estadoImportacion.mensaje}
        </p>
      )}

      <MateriasList
        materias={materias}
        onEditar={abrirEdicion}
        onCalcularNota={setMateriaCalculando}
      />

      <MateriaForm
        open={formAbierto}
        onOpenChange={setFormAbierto}
        materia={materiaEditando}
        materiasDisponibles={materias}
        escalaNotas={escalaNotas}
      />

      <NotaNecesariaDialog
        open={materiaCalculando !== null}
        onOpenChange={(open) => !open && setMateriaCalculando(null)}
        materia={materiaCalculando}
        escalaNotas={escalaNotas}
      />
    </div>
  );
}

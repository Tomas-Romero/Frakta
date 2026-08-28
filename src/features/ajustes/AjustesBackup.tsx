import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { exportarBackupComoArchivo, importarBackupDesdeTexto } from '@/db/backup';

type Estado =
  | { tipo: 'inactivo' }
  | { tipo: 'cargando' }
  | { tipo: 'exito'; mensaje: string }
  | { tipo: 'error'; mensaje: string };

export function AjustesBackup() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'inactivo' });
  const inputRef = useRef<HTMLInputElement>(null);

  async function manejarExportar() {
    setEstado({ tipo: 'cargando' });
    try {
      await exportarBackupComoArchivo();
      setEstado({ tipo: 'exito', mensaje: 'Backup exportado correctamente.' });
    } catch (error) {
      setEstado({ tipo: 'error', mensaje: `No se pudo exportar: ${(error as Error).message}` });
    }
  }

  async function manejarArchivoSeleccionado(archivo: File) {
    const confirmado = window.confirm(
      'Importar este backup reemplaza todos los datos guardados localmente. ¿Continuar?',
    );
    if (!confirmado) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setEstado({ tipo: 'cargando' });
    try {
      const texto = await archivo.text();
      const backup = await importarBackupDesdeTexto(texto);
      setEstado({
        tipo: 'exito',
        mensaje: `Backup importado: ${backup.datos.materias.length} materias, ${backup.datos.tareas.length} tareas, ${backup.datos.movimientos.length} movimientos.`,
      });
    } catch (error) {
      setEstado({ tipo: 'error', mensaje: `Importación rechazada: ${(error as Error).message}` });
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Respaldo (JSON)</CardTitle>
          <CardDescription>
            Único mecanismo de respaldo: no hay sincronización remota. Exportá seguido — si
            borrás los datos del navegador sin haber exportado, se pierden para siempre.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={manejarExportar} disabled={estado.tipo === 'cargando'}>
            <Download />
            Exportar backup
          </Button>

          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={estado.tipo === 'cargando'}
          >
            <Upload />
            Importar backup
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) void manejarArchivoSeleccionado(archivo);
            }}
          />
        </CardContent>
      </Card>

      {estado.tipo === 'exito' && (
        <p className="rounded-md border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          {estado.mensaje}
        </p>
      )}
      {estado.tipo === 'error' && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {estado.mensaje}
        </p>
      )}
    </div>
  );
}

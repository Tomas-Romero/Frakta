import { useEffect, useRef, useState } from 'react';
import { Download, Monitor, Moon, ShieldCheck, Sun, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { exportarBackupComoArchivo, importarBackupDesdeTexto } from '@/db/backup';
import { useTema, cambiarTema } from '@/hooks/useTema';
import {
  pedirPermisoNotificaciones,
  permisoNotificaciones,
} from '@/lib/notificaciones';
import { cn } from '@/lib/utils';
import type { ConfigApp } from '@/db/db';

type Estado =
  | { tipo: 'inactivo' }
  | { tipo: 'cargando' }
  | { tipo: 'exito'; mensaje: string }
  | { tipo: 'error'; mensaje: string };

const OPCIONES_TEMA: { valor: ConfigApp['tema']; etiqueta: string; icono: typeof Sun }[] = [
  { valor: 'auto', etiqueta: 'Automático', icono: Monitor },
  { valor: 'claro', etiqueta: 'Claro', icono: Sun },
  { valor: 'oscuro', etiqueta: 'Oscuro', icono: Moon },
];

export function AjustesBackup() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'inactivo' });
  const inputRef = useRef<HTMLInputElement>(null);
  const tema = useTema();
  const [permiso, setPermiso] = useState(permisoNotificaciones());
  const [persistido, setPersistido] = useState<boolean | null>(null);

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersistido);
  }, []);

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

  async function manejarPedirNotificaciones() {
    const resultado = await pedirPermisoNotificaciones();
    setPermiso(resultado);
  }

  async function manejarPedirPersistencia() {
    const resultado = await navigator.storage?.persist?.();
    setPersistido(resultado ?? null);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Elegí cómo se ve la app en este dispositivo.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {OPCIONES_TEMA.map(({ valor, etiqueta, icono: Icono }) => (
            <button
              key={valor}
              type="button"
              onClick={() => void cambiarTema(valor)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1.5 rounded-lg border py-3 text-sm transition-colors',
                tema === valor
                  ? 'border-primary bg-accent text-accent-foreground'
                  : 'hover:bg-muted',
              )}
            >
              <Icono className="size-4" />
              {etiqueta}
            </button>
          ))}
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Recordatorios</CardTitle>
          <CardDescription>
            Avisa de tareas y débitos automáticos que vencen pronto mientras la app está abierta
            en una pestaña. Sin backend no hay push garantizado con la app cerrada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permiso === 'no-soportado' ? (
            <p className="text-sm text-muted-foreground">
              Este navegador no soporta notificaciones.
            </p>
          ) : permiso === 'granted' ? (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-4" /> Recordatorios activados.
            </p>
          ) : (
            <Button
              variant="outline"
              onClick={() => void manejarPedirNotificaciones()}
              disabled={permiso === 'denied'}
            >
              {permiso === 'denied' ? 'Bloqueadas en el navegador' : 'Activar recordatorios'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Almacenamiento persistente</CardTitle>
          <CardDescription>
            Reduce el riesgo de que el navegador borre los datos guardados si el disco queda sin
            espacio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {persistido ? (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-4" /> Activado.
            </p>
          ) : (
            <Button variant="outline" onClick={() => void manejarPedirPersistencia()}>
              Pedir almacenamiento persistente
            </Button>
          )}
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

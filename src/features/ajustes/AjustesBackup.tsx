import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, Download, Monitor, Moon, ShieldCheck, Sun, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { exportarBackupComoArchivo, importarBackupDesdeTexto } from '@/db/backup';
import { obtenerConfig, actualizarConfig } from '@/db/db';
import { reiniciarTodosLosDatos } from '@/db/reiniciar';
import { useTema, cambiarTema } from '@/hooks/useTema';
import {
  pedirPermisoNotificaciones,
  permisoNotificaciones,
} from '@/lib/notificaciones';
import { useUiStore } from '@/store/uiStore';
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

const PALABRA_CONFIRMACION = 'REINICIAR';

export function AjustesBackup() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'inactivo' });
  const inputRef = useRef<HTMLInputElement>(null);
  const tema = useTema();
  const config = useLiveQuery(() => obtenerConfig());
  const [permiso, setPermiso] = useState(permisoNotificaciones());
  const [persistido, setPersistido] = useState<boolean | null>(null);
  const [confirmarReinicio, setConfirmarReinicio] = useState(false);
  const [textoConfirmacion, setTextoConfirmacion] = useState('');
  const marcarBackupExportado = useUiStore((s) => s.marcarBackupExportado);

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersistido);
  }, []);

  async function manejarExportar() {
    setEstado({ tipo: 'cargando' });
    try {
      await exportarBackupComoArchivo();
      marcarBackupExportado();
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

  async function manejarReiniciar() {
    setConfirmarReinicio(false);
    setTextoConfirmacion('');
    setEstado({ tipo: 'cargando' });
    try {
      await reiniciarTodosLosDatos();
      window.location.reload();
    } catch (error) {
      setEstado({ tipo: 'error', mensaje: `No se pudo reiniciar: ${(error as Error).message}` });
    }
  }

  if (!config) return null;

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
        <CardHeader className="flex items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle>Recordatorios</CardTitle>
            <CardDescription>
              Avisa de tareas y débitos automáticos que vencen pronto mientras la app está
              abierta en una pestaña. Sin backend no hay push garantizado con la app cerrada.
            </CardDescription>
          </div>
          <Switch
            checked={config.recordatoriosActivos}
            onCheckedChange={(activo) => void actualizarConfig({ recordatoriosActivos: activo })}
            aria-label="Activar o desactivar recordatorios"
          />
        </CardHeader>
        {config.recordatoriosActivos && (
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
        )}
      </Card>

      <Card>
        <CardHeader className="flex items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle>Almacenamiento persistente</CardTitle>
            <CardDescription>
              Reduce el riesgo de que el navegador borre los datos guardados si el disco queda
              sin espacio.
            </CardDescription>
          </div>
          <Switch
            checked={config.almacenamientoPersistenteActivo}
            onCheckedChange={(activo) =>
              void actualizarConfig({ almacenamientoPersistenteActivo: activo })
            }
            aria-label="Activar o desactivar la solicitud de almacenamiento persistente"
          />
        </CardHeader>
        <CardContent>
          {persistido ? (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-4" /> Activado en este navegador.
              {!config.almacenamientoPersistenteActivo && (
                <span className="text-muted-foreground">
                  {' '}
                  — el navegador no permite revocarlo por acá; hacelo desde la configuración del
                  sitio si querés desactivarlo del todo.
                </span>
              )}
            </p>
          ) : config.almacenamientoPersistenteActivo ? (
            <Button variant="outline" onClick={() => void manejarPedirPersistencia()}>
              Pedir almacenamiento persistente ahora
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Desactivado — la app no lo va a pedir al abrirse.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-destructive">
            <AlertTriangle className="size-4" /> Zona de peligro
          </CardTitle>
          <CardDescription>
            Borra materias, horario, tareas, finanzas, gastos compartidos y preferencias — todo.
            Exportá un backup antes si no estás seguro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmarReinicio(true)}
          >
            Reiniciar toda la información
          </Button>
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

      <AlertDialog
        open={confirmarReinicio}
        onOpenChange={(open) => {
          setConfirmarReinicio(open);
          if (!open) setTextoConfirmacion('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reiniciar toda la información?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto borra absolutamente todo lo guardado en este navegador — materias, horario,
              tareas, proyectos, finanzas, gastos compartidos y preferencias — y no se puede
              deshacer. Para confirmar, escribí <strong>{PALABRA_CONFIRMACION}</strong> abajo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="confirmar-reinicio" className="sr-only">
              Escribí {PALABRA_CONFIRMACION} para confirmar
            </Label>
            <Input
              id="confirmar-reinicio"
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value)}
              placeholder={PALABRA_CONFIRMACION}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={textoConfirmacion.trim().toUpperCase() !== PALABRA_CONFIRMACION}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void manejarReiniciar()}
            >
              Reiniciar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import QrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min.js?url';
import { Camera, CameraOff, Check, Upload } from 'lucide-react';
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogFooter as DialogFooter,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { decodificarPayloadQr } from './qrPayload';
import { importarEventoDesdeTexto } from './exportarEvento';
import { crearEventoDesdeImportacionQr } from '@/db/repositorios/eventosCompartidos';
import type { PayloadQrEventoValidado } from './qrPayloadSchema';

QrScanner.WORKER_PATH = QrScannerWorkerPath;

type Estado =
  | { tipo: 'escaneando' }
  | { tipo: 'confirmar'; payload: PayloadQrEventoValidado }
  | { tipo: 'importando' }
  | { tipo: 'error'; mensaje: string };

interface EscanearQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportado: (eventoId: string) => void;
}

export function EscanearQrDialog({ open, onOpenChange, onImportado }: EscanearQrDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<Estado>({ tipo: 'escaneando' });

  useEffect(() => {
    if (!open) {
      setEstado({ tipo: 'escaneando' });
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    // Guard contra manejar un decode o un error de arranque después de que
    // el escaneo ya se dio por terminado (éxito, cierre del diálogo o
    // desmontaje) — evita setState sobre un escaneo que ya no importa y
    // asegura que la cámara se detenga/destruya una sola vez.
    let destruido = false;
    const scanner = new QrScanner(
      video,
      (resultado) => {
        if (destruido) return;
        try {
          const payload = decodificarPayloadQr(resultado.data);
          destruido = true;
          scanner.stop();
          scanner.destroy();
          setEstado({ tipo: 'confirmar', payload });
        } catch (error) {
          setEstado({ tipo: 'error', mensaje: (error as Error).message });
        }
      },
      { highlightScanRegion: true, highlightCodeOutline: true },
    );

    scanner.start().catch((error: Error) => {
      if (destruido) return;
      const mensaje =
        error.name === 'NotAllowedError'
          ? 'No se pudo acceder a la cámara — el navegador bloqueó el permiso.'
          : error.name === 'NotFoundError'
            ? 'No se encontró ninguna cámara en este dispositivo.'
            : `No se pudo iniciar la cámara: ${error.message}`;
      setEstado({ tipo: 'error', mensaje });
    });

    return () => {
      if (!destruido) {
        destruido = true;
        scanner.stop();
        scanner.destroy();
      }
    };
  }, [open]);

  async function confirmarImportacion(payload: PayloadQrEventoValidado) {
    setEstado({ tipo: 'importando' });
    try {
      const evento = await crearEventoDesdeImportacionQr(payload.evento);
      onOpenChange(false);
      onImportado(evento.id);
    } catch (error) {
      setEstado({ tipo: 'error', mensaje: (error as Error).message });
    }
  }

  async function manejarArchivoSeleccionado(archivo: File) {
    setEstado({ tipo: 'importando' });
    try {
      const texto = await archivo.text();
      const evento = await importarEventoDesdeTexto(texto);
      onOpenChange(false);
      onImportado(evento.id);
    } catch (error) {
      setEstado({ tipo: 'error', mensaje: (error as Error).message });
    } finally {
      if (inputArchivoRef.current) inputArchivoRef.current.value = '';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escanear evento</DialogTitle>
          <DialogDescription>
            Apuntá la cámara al código QR generado desde otro dispositivo. Se importa como un
            evento nuevo — nunca se mezcla con uno existente.
          </DialogDescription>
        </DialogHeader>

        {estado.tipo === 'confirmar' ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              Se encontró el evento <strong>"{estado.payload.evento.nombre}"</strong> con{' '}
              {estado.payload.evento.participantes.length} participantes y{' '}
              {estado.payload.evento.gastos.length} gastos. Se va a crear como un evento nuevo.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={() => void confirmarImportacion(estado.payload)}>
                <Check /> Importar como evento nuevo
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-lg bg-black">
              <video
                ref={videoRef}
                className="aspect-square w-full object-cover"
                muted
                playsInline
              />
            </div>

            {estado.tipo === 'error' && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <CameraOff className="size-4 shrink-0" /> {estado.mensaje}
              </p>
            )}
            {estado.tipo === 'importando' && (
              <p className="text-sm text-muted-foreground">Importando…</p>
            )}
            {estado.tipo === 'escaneando' && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Camera className="size-4 shrink-0" /> Buscando un código…
              </p>
            )}

            <div className="flex items-center gap-2 border-t pt-3">
              <p className="flex-1 text-sm text-muted-foreground">
                ¿Te compartieron un archivo en vez de un QR?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => inputArchivoRef.current?.click()}
                disabled={estado.tipo === 'importando'}
              >
                <Upload /> Importar archivo
              </Button>
              <input
                ref={inputArchivoRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const archivo = e.target.files?.[0];
                  if (archivo) void manejarArchivoSeleccionado(archivo);
                }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

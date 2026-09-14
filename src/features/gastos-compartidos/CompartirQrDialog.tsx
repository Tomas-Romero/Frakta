import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { codificarEventoParaQr, cabeEnQr } from './qrPayload';
import { exportarEventoComoArchivo } from './exportarEvento';
import type { EventoCompartido } from '@/types/models';

interface CompartirQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento: EventoCompartido;
}

export function CompartirQrDialog({ open, onOpenChange, evento }: CompartirQrDialogProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [demasiadoGrande, setDemasiadoGrande] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDataUrl(null);

    const payload = codificarEventoParaQr(evento);
    if (!cabeEnQr(payload)) {
      setDemasiadoGrande(true);
      return;
    }
    setDemasiadoGrande(false);

    let cancelado = false;
    void QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, width: 320 }).then(
      (url) => {
        if (!cancelado) setDataUrl(url);
      },
    );
    return () => {
      cancelado = true;
    };
  }, [open, evento]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartir "{evento.nombre}"</DialogTitle>
          <DialogDescription>
            Escaneá este código desde Frakta en otro dispositivo para importarlo — se crea como
            un evento nuevo ahí, no sincroniza cambios en vivo con este.
          </DialogDescription>
        </DialogHeader>

        {demasiadoGrande ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Este evento tiene demasiados gastos o participantes para entrar en un código QR
              legible. Compartilo como archivo en su lugar — del otro lado se importa desde
              "Escanear QR → Importar archivo".
            </p>
            <Button onClick={() => void exportarEventoComoArchivo(evento)}>
              <Download /> Descargar archivo del evento
            </Button>
          </div>
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt={`Código QR del evento ${evento.nombre}`}
            className="mx-auto rounded-lg"
            width={320}
            height={320}
          />
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">Generando código…</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

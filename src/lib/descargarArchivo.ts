import { saveAs } from 'file-saver';

export function descargarBlob(blob: Blob, nombre: string): void {
  saveAs(blob, nombre);
}

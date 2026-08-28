import ExcelJS from 'exceljs';
import { descargarBlob } from '../../lib/descargarArchivo';
import type { EstadoMateria, Materia } from '../../types/models';

// ExcelJS, no SheetJS: la Community Edition de SheetJS no escribe estilos de
// celda (colores, rellenos) sin la versión Pro paga. Ver BLUEPRINT.md sección 2.1.
const COLOR_ESTADO: Record<EstadoMateria, string> = {
  Aprobado: 'FF2F8F5B',
  Cursando: 'FFB1791A',
  Regular: 'FF2D7DA6',
  PorCursar: 'FF8B93A1',
};

export async function exportarMateriasComoXlsx(materias: Materia[]): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Materias', { views: [{ state: 'frozen', ySplit: 1 }] });

  ws.columns = [
    { header: 'Materia', key: 'nombre', width: 32 },
    { header: 'Año', key: 'anio', width: 8 },
    { header: 'Hs/semana', key: 'hsSem', width: 12 },
    { header: 'Horas totales', key: 'hsTotal', width: 14 },
    { header: 'Nota', key: 'nota', width: 8 },
    { header: 'Estado', key: 'estado', width: 14 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF17202B' } };

  materias.forEach((m) => {
    const row = ws.addRow({
      nombre: m.nombre,
      anio: m.anioCursado,
      hsSem: m.cargaHoraria.semanal,
      hsTotal: m.cargaHoraria.total,
      nota: m.nota ?? '—',
      estado: m.estado,
    });
    row.getCell('estado').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLOR_ESTADO[m.estado] },
    };
    row.getCell('estado').font = { color: { argb: 'FFFFFFFF' } };
  });
  ws.autoFilter = 'A1:F1';

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  descargarBlob(blob, `materias-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

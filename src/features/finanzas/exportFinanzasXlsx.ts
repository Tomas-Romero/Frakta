import ExcelJS from 'exceljs';
import { descargarBlob } from '../../lib/descargarArchivo';
import type { MovimientoFinanciero, TipoMovimiento } from '../../types/models';

const COLOR_TIPO: Record<TipoMovimiento, string> = {
  gasto: 'FFB1544A',
  ingreso: 'FF2F8F5B',
};

export async function exportarMovimientosComoXlsx(movimientos: MovimientoFinanciero[]): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Movimientos', { views: [{ state: 'frozen', ySplit: 1 }] });

  ws.columns = [
    { header: 'Fecha', key: 'fecha', width: 14 },
    { header: 'Tipo', key: 'tipo', width: 12 },
    { header: 'Categoría', key: 'categoria', width: 20 },
    { header: 'Descripción', key: 'descripcion', width: 32 },
    { header: 'Monto', key: 'monto', width: 14 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF17202B' } };

  const ordenados = [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha));
  ordenados.forEach((m) => {
    const row = ws.addRow({
      fecha: m.fecha,
      tipo: m.tipo,
      categoria: m.categoria,
      descripcion: m.descripcion,
      monto: m.tipo === 'gasto' ? -m.monto : m.monto,
    });
    row.getCell('tipo').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLOR_TIPO[m.tipo] },
    };
    row.getCell('tipo').font = { color: { argb: 'FFFFFFFF' } };
    row.getCell('monto').numFmt = '#,##0.00';
  });
  ws.autoFilter = 'A1:E1';

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  descargarBlob(blob, `movimientos-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

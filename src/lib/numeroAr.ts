// Formato Argentina: `,` como separador decimal, `.` como separador de miles.
// Compartido por CSV, formularios y Finanzas — nunca asumir el formato de
// EE.UU. en un parser nuevo.

export function parseNumeroAr(texto: string): number {
  const normalizado = texto.trim().replace(/\./g, '').replace(',', '.');
  const numero = Number(normalizado);
  if (Number.isNaN(numero)) throw new Error(`"${texto}" no es un número válido`);
  return numero;
}

export function formatNumeroAr(n: number): string {
  return n.toString().replace('.', ',');
}

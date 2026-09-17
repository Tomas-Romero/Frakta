import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Trophy } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatNumeroAr } from '@/lib/numeroAr';
import {
  nombresEjerciciosFuerza,
  progresoPesoMaximo,
  recordPersonal,
  volumenPorSemana,
} from './metricas';
import type { RegistroEjercicio } from '@/types/models';

function formatearPesoTooltip(valor: unknown): string {
  return `${formatNumeroAr(Number(valor))} kg`;
}

interface ReportesHabitosProps {
  registros: RegistroEjercicio[];
}

export function ReportesHabitos({ registros }: ReportesHabitosProps) {
  const nombres = nombresEjerciciosFuerza(registros);
  const [ejercicio, setEjercicio] = useState(nombres[0] ?? '');

  const progreso = ejercicio ? progresoPesoMaximo(registros, ejercicio) : [];
  const record = ejercicio ? recordPersonal(registros, ejercicio) : null;
  const volumenSemanal = volumenPorSemana(registros);

  if (nombres.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Cargá al menos una sesión de fuerza para ver reportes de avance.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={ejercicio} onValueChange={setEjercicio}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Elegí un ejercicio" />
          </SelectTrigger>
          <SelectContent>
            {nombres.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {record && (
          <Card className="w-full shrink-0 sm:w-auto sm:min-w-[220px]">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 py-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-gold/20 text-[#8a6d1f] dark:text-brand-gold">
                <Trophy className="size-4" />
              </span>
              <div>
                <CardDescription>Récord personal</CardDescription>
                <CardTitle className="text-lg">
                  {formatNumeroAr(record.pesoKg)} kg
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    · {format(parseISO(record.fecha), 'd MMM yyyy', { locale: es })}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-medium">Progreso de peso máximo — {ejercicio}</h4>
          {progreso.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Sin sesiones cargadas para este ejercicio.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={progreso}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={(f: string) => format(parseISO(f), 'd MMM', { locale: es })}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={formatearPesoTooltip}
                  labelFormatter={(label) =>
                    typeof label === 'string'
                      ? format(parseISO(label), 'd MMM yyyy', { locale: es })
                      : String(label)
                  }
                />
                <Line
                  type="monotone"
                  dataKey="pesoMaximo"
                  name="Peso máximo"
                  stroke="#b5793a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium">Constancia (últimas 8 semanas)</h4>
          {volumenSemanal.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Sin sesiones registradas todavía.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={volumenSemanal}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="sesiones" name="Sesiones" fill="#2d7d6c" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

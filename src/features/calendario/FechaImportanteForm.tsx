import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Ban } from 'lucide-react';
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogFooter as DialogFooter,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { parseNumeroAr } from '@/lib/numeroAr';
import { crearFechaImportante, actualizarFechaImportante } from '@/db/repositorios/fechasImportantes';
import { ICONOS_FECHA, NOMBRES_ICONOS_FECHA, type NombreIconoFecha } from './iconosFecha';
import type { FechaImportante, TipoRecurrenciaFecha } from '@/types/models';

const SIN_ICONO = '__ninguno__';

const TIPOS_RECURRENCIA: { valor: TipoRecurrenciaFecha; etiqueta: string; descripcion: string }[] = [
  { valor: 'unica', etiqueta: 'Una vez', descripcion: 'Una fecha puntual (ej. un examen).' },
  { valor: 'anual', etiqueta: 'Todos los años', descripcion: 'Mismo día y mes cada año (ej. un cumpleaños).' },
  { valor: 'mensual', etiqueta: 'Todos los meses', descripcion: 'Mismo día en cada mes del año.' },
  { valor: 'meses_especificos', etiqueta: 'Algunos meses', descripcion: 'Mismo día, solo en los meses que elijas.' },
];

const MESES = [
  { valor: '1', etiqueta: 'Enero' },
  { valor: '2', etiqueta: 'Febrero' },
  { valor: '3', etiqueta: 'Marzo' },
  { valor: '4', etiqueta: 'Abril' },
  { valor: '5', etiqueta: 'Mayo' },
  { valor: '6', etiqueta: 'Junio' },
  { valor: '7', etiqueta: 'Julio' },
  { valor: '8', etiqueta: 'Agosto' },
  { valor: '9', etiqueta: 'Septiembre' },
  { valor: '10', etiqueta: 'Octubre' },
  { valor: '11', etiqueta: 'Noviembre' },
  { valor: '12', etiqueta: 'Diciembre' },
];

const esquemaFormulario = z
  .object({
    nombre: z.string().trim().min(1, 'Ingresá un nombre'),
    icono: z.string(),
    tipoRecurrencia: z.enum(['unica', 'anual', 'mensual', 'meses_especificos']),
    fechaUnica: z.string(),
    diaAnual: z.string(),
    mesAnual: z.string(),
    diaMensual: z.string(),
    diaMesesEspecificos: z.string(),
    mesesEspecificos: z.array(z.string()),
    notas: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.tipoRecurrencia === 'unica' && v.fechaUnica.trim() === '') {
      ctx.addIssue({ code: 'custom', path: ['fechaUnica'], message: 'Requerido' });
    }
    if (v.tipoRecurrencia === 'anual') {
      if (v.diaAnual.trim() === '') ctx.addIssue({ code: 'custom', path: ['diaAnual'], message: 'Requerido' });
      if (v.mesAnual.trim() === '') ctx.addIssue({ code: 'custom', path: ['mesAnual'], message: 'Elegí un mes' });
    }
    if (v.tipoRecurrencia === 'mensual' && v.diaMensual.trim() === '') {
      ctx.addIssue({ code: 'custom', path: ['diaMensual'], message: 'Requerido' });
    }
    if (v.tipoRecurrencia === 'meses_especificos') {
      if (v.diaMesesEspecificos.trim() === '') {
        ctx.addIssue({ code: 'custom', path: ['diaMesesEspecificos'], message: 'Requerido' });
      }
      if (v.mesesEspecificos.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['mesesEspecificos'], message: 'Elegí al menos un mes' });
      }
    }
  });

type ValoresFormulario = z.infer<typeof esquemaFormulario>;

function valoresPorDefecto(fecha?: FechaImportante): ValoresFormulario {
  if (!fecha) {
    return {
      nombre: '',
      icono: SIN_ICONO,
      tipoRecurrencia: 'anual',
      fechaUnica: format(new Date(), 'yyyy-MM-dd'),
      diaAnual: '',
      mesAnual: '',
      diaMensual: '',
      diaMesesEspecificos: '',
      mesesEspecificos: [],
      notas: '',
    };
  }
  return {
    nombre: fecha.nombre,
    icono: fecha.icono ?? SIN_ICONO,
    tipoRecurrencia: fecha.tipoRecurrencia,
    fechaUnica: fecha.fechaUnica ?? format(new Date(), 'yyyy-MM-dd'),
    diaAnual: fecha.diaAnual === null ? '' : String(fecha.diaAnual),
    mesAnual: fecha.mesAnual === null ? '' : String(fecha.mesAnual),
    diaMensual: fecha.diaMensual === null ? '' : String(fecha.diaMensual),
    diaMesesEspecificos: fecha.diaMesesEspecificos === null ? '' : String(fecha.diaMesesEspecificos),
    mesesEspecificos: fecha.mesesEspecificos?.map(String) ?? [],
    notas: fecha.notas ?? '',
  };
}

function diaEnRango(valor: string): number {
  const n = Math.trunc(parseNumeroAr(valor));
  if (n < 1 || n > 31) throw new Error('Debe estar entre 1 y 31');
  return n;
}

interface FechaImportanteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fecha?: FechaImportante;
}

export function FechaImportanteForm({ open, onOpenChange, fecha }: FechaImportanteFormProps) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresPorDefecto(fecha),
  });

  useEffect(() => {
    if (open) form.reset(valoresPorDefecto(fecha));
  }, [open, fecha, form]);

  const tipoRecurrencia = form.watch('tipoRecurrencia');

  async function onSubmit(valores: ValoresFormulario) {
    try {
      const datos = {
        nombre: valores.nombre.trim(),
        icono: valores.icono === SIN_ICONO ? null : valores.icono,
        tipoRecurrencia: valores.tipoRecurrencia,
        fechaUnica: valores.tipoRecurrencia === 'unica' ? valores.fechaUnica : null,
        diaAnual: valores.tipoRecurrencia === 'anual' ? diaEnRango(valores.diaAnual) : null,
        mesAnual: valores.tipoRecurrencia === 'anual' ? Number(valores.mesAnual) : null,
        diaMensual: valores.tipoRecurrencia === 'mensual' ? diaEnRango(valores.diaMensual) : null,
        diaMesesEspecificos:
          valores.tipoRecurrencia === 'meses_especificos'
            ? diaEnRango(valores.diaMesesEspecificos)
            : null,
        mesesEspecificos:
          valores.tipoRecurrencia === 'meses_especificos'
            ? valores.mesesEspecificos.map(Number)
            : null,
        notas: valores.notas.trim() === '' ? null : valores.notas.trim(),
      };

      if (fecha) {
        await actualizarFechaImportante(fecha.id, datos);
      } else {
        await crearFechaImportante(datos);
      }
      onOpenChange(false);
    } catch (error) {
      const campoDia =
        valores.tipoRecurrencia === 'anual'
          ? 'diaAnual'
          : valores.tipoRecurrencia === 'mensual'
            ? 'diaMensual'
            : 'diaMesesEspecificos';
      form.setError(campoDia, { message: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fecha ? 'Editar fecha' : 'Nueva fecha importante'}</DialogTitle>
          <DialogDescription>
            Exámenes puntuales, cumpleaños, aniversarios o cualquier día que no quieras olvidar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Cumpleaños de mamá" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícono (opcional)</FormLabel>
                  <div className="grid grid-cols-9 gap-1.5 rounded-md border p-2">
                    <button
                      type="button"
                      title="Sin ícono"
                      onClick={() => field.onChange(SIN_ICONO)}
                      className={cn(
                        'flex size-8 items-center justify-center rounded-md border text-muted-foreground',
                        field.value === SIN_ICONO
                          ? 'border-primary bg-accent'
                          : 'border-transparent hover:bg-muted',
                      )}
                    >
                      <Ban className="size-4" />
                    </button>
                    {NOMBRES_ICONOS_FECHA.map((nombre) => {
                      const Icono = ICONOS_FECHA[nombre as NombreIconoFecha];
                      return (
                        <button
                          key={nombre}
                          type="button"
                          title={nombre}
                          onClick={() => field.onChange(nombre)}
                          className={cn(
                            'flex size-8 items-center justify-center rounded-md border',
                            field.value === nombre
                              ? 'border-primary bg-accent'
                              : 'border-transparent hover:bg-muted',
                          )}
                        >
                          <Icono className="size-4" />
                        </button>
                      );
                    })}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoRecurrencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Con qué frecuencia se repite?</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {TIPOS_RECURRENCIA.map(({ valor, etiqueta }) => (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => field.onChange(valor)}
                        className={cn(
                          'rounded-md border px-3 py-1.5 text-sm',
                          field.value === valor
                            ? 'border-primary bg-accent text-accent-foreground'
                            : 'text-muted-foreground',
                        )}
                      >
                        {etiqueta}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {TIPOS_RECURRENCIA.find((t) => t.valor === field.value)?.descripcion}
                  </p>
                </FormItem>
              )}
            />

            {tipoRecurrencia === 'unica' && (
              <FormField
                control={form.control}
                name="fechaUnica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {tipoRecurrencia === 'anual' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="diaAnual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Día</FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" placeholder="15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mesAnual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mes</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Elegí un mes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MESES.map((m) => (
                            <SelectItem key={m.valor} value={m.valor}>
                              {m.etiqueta}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {tipoRecurrencia === 'mensual' && (
              <FormField
                control={form.control}
                name="diaMensual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día de cada mes</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {tipoRecurrencia === 'meses_especificos' && (
              <>
                <FormField
                  control={form.control}
                  name="diaMesesEspecificos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Día del mes</FormLabel>
                      <FormControl>
                        <Input inputMode="numeric" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mesesEspecificos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿En qué meses?</FormLabel>
                      <div className="grid grid-cols-3 gap-2 rounded-md border p-3 sm:grid-cols-4">
                        {MESES.map((m) => (
                          <label key={m.valor} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value.includes(m.valor)}
                              onCheckedChange={(marcado) => {
                                field.onChange(
                                  marcado
                                    ? [...field.value, m.valor]
                                    : field.value.filter((v) => v !== m.valor),
                                );
                              }}
                            />
                            {m.etiqueta}
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

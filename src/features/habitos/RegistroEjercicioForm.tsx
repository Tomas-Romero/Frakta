import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Ban, Plus, Trash2 } from 'lucide-react';
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogFooter as DialogFooter,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { parseNumeroAr, formatNumeroAr } from '@/lib/numeroAr';
import { crearRegistroEjercicio, actualizarRegistroEjercicio } from '@/db/repositorios/registrosEjercicio';
import { ICONOS_FITNESS, NOMBRES_ICONOS_FITNESS, type NombreIconoFitness } from './iconosFitness';
import type { RegistroEjercicio, TipoRegistroEjercicio } from '@/types/models';

const SIN_ICONO = '__ninguno__';

const TIPOS: { valor: TipoRegistroEjercicio; etiqueta: string }[] = [
  { valor: 'fuerza', etiqueta: 'Fuerza' },
  { valor: 'triserie_core', etiqueta: 'Triserie core' },
  { valor: 'cardio', etiqueta: 'Cardio' },
];

const setRealizadoSchema = z.object({
  repeticiones: z.string(),
  pesoKg: z.string(),
});

const ejercicioTriserieSchema = z.object({
  nombre: z.string().trim(),
  series: z.string(),
  repeticiones: z.string(),
});

const esquemaFormulario = z
  .object({
    fecha: z.string().min(1, 'Requerido'),
    tipo: z.enum(['fuerza', 'triserie_core', 'cardio']),
    icono: z.string(),
    nombreEjercicio: z.string(),
    seriesRealizadas: z.array(setRealizadoSchema),
    ejerciciosTriserie: z.array(ejercicioTriserieSchema).length(3),
    duracionMin: z.string(),
    distanciaKm: z.string(),
    notas: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.tipo === 'fuerza') {
      if (v.nombreEjercicio.trim() === '') {
        ctx.addIssue({ code: 'custom', path: ['nombreEjercicio'], message: 'Requerido' });
      }
      if (v.seriesRealizadas.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['seriesRealizadas'], message: 'Agregá al menos una serie' });
      }
      v.seriesRealizadas.forEach((s, i) => {
        if (s.repeticiones.trim() === '') {
          ctx.addIssue({ code: 'custom', path: ['seriesRealizadas', i, 'repeticiones'], message: 'Requerido' });
        }
        if (s.pesoKg.trim() === '') {
          ctx.addIssue({ code: 'custom', path: ['seriesRealizadas', i, 'pesoKg'], message: 'Requerido' });
        }
      });
    }
    if (v.tipo === 'triserie_core') {
      v.ejerciciosTriserie.forEach((e, i) => {
        if (e.nombre.trim() === '') {
          ctx.addIssue({ code: 'custom', path: ['ejerciciosTriserie', i, 'nombre'], message: 'Requerido' });
        }
        if (e.series.trim() === '') {
          ctx.addIssue({ code: 'custom', path: ['ejerciciosTriserie', i, 'series'], message: 'Requerido' });
        }
        if (e.repeticiones.trim() === '') {
          ctx.addIssue({ code: 'custom', path: ['ejerciciosTriserie', i, 'repeticiones'], message: 'Requerido' });
        }
      });
    }
    if (v.tipo === 'cardio' && v.duracionMin.trim() === '') {
      ctx.addIssue({ code: 'custom', path: ['duracionMin'], message: 'Requerido' });
    }
  });

type ValoresFormulario = z.infer<typeof esquemaFormulario>;

function triserieVacia(): ValoresFormulario['ejerciciosTriserie'] {
  return [
    { nombre: '', series: '', repeticiones: '' },
    { nombre: '', series: '', repeticiones: '' },
    { nombre: '', series: '', repeticiones: '' },
  ];
}

function valoresPorDefecto(registro?: RegistroEjercicio): ValoresFormulario {
  if (!registro) {
    return {
      fecha: format(new Date(), 'yyyy-MM-dd'),
      tipo: 'fuerza',
      icono: SIN_ICONO,
      nombreEjercicio: '',
      seriesRealizadas: [{ repeticiones: '', pesoKg: '' }],
      ejerciciosTriserie: triserieVacia(),
      duracionMin: '',
      distanciaKm: '',
      notas: '',
    };
  }
  return {
    fecha: registro.fecha,
    tipo: registro.tipo,
    icono: registro.icono ?? SIN_ICONO,
    nombreEjercicio: registro.nombreEjercicio ?? '',
    seriesRealizadas: registro.seriesRealizadas?.length
      ? registro.seriesRealizadas.map((s) => ({
          repeticiones: String(s.repeticiones),
          pesoKg: formatNumeroAr(s.pesoKg),
        }))
      : [{ repeticiones: '', pesoKg: '' }],
    ejerciciosTriserie: registro.ejerciciosTriserie
      ? registro.ejerciciosTriserie.map((e) => ({
          nombre: e.nombre,
          series: String(e.series),
          repeticiones: String(e.repeticiones),
        }))
      : triserieVacia(),
    duracionMin: registro.duracionMin === null ? '' : formatNumeroAr(registro.duracionMin),
    distanciaKm: registro.distanciaKm === null ? '' : formatNumeroAr(registro.distanciaKm),
    notas: registro.notas ?? '',
  };
}

interface RegistroEjercicioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro?: RegistroEjercicio;
}

export function RegistroEjercicioForm({ open, onOpenChange, registro }: RegistroEjercicioFormProps) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresPorDefecto(registro),
  });

  const camposSeries = useFieldArray({ control: form.control, name: 'seriesRealizadas' });

  useEffect(() => {
    if (open) form.reset(valoresPorDefecto(registro));
  }, [open, registro, form]);

  const tipo = form.watch('tipo');

  async function onSubmit(valores: ValoresFormulario) {
    try {
      const datos = {
        fecha: valores.fecha,
        tipo: valores.tipo,
        icono: valores.icono === SIN_ICONO ? null : valores.icono,
        nombreEjercicio: valores.tipo === 'fuerza' ? valores.nombreEjercicio.trim() : null,
        seriesRealizadas:
          valores.tipo === 'fuerza'
            ? valores.seriesRealizadas.map((s) => ({
                repeticiones: Math.trunc(parseNumeroAr(s.repeticiones)),
                pesoKg: parseNumeroAr(s.pesoKg),
              }))
            : null,
        ejerciciosTriserie:
          valores.tipo === 'triserie_core'
            ? valores.ejerciciosTriserie.map((e) => ({
                nombre: e.nombre.trim(),
                series: Math.trunc(parseNumeroAr(e.series)),
                repeticiones: Math.trunc(parseNumeroAr(e.repeticiones)),
              }))
            : null,
        duracionMin: valores.tipo === 'cardio' ? parseNumeroAr(valores.duracionMin) : null,
        distanciaKm:
          valores.tipo === 'cardio' && valores.distanciaKm.trim() !== ''
            ? parseNumeroAr(valores.distanciaKm)
            : null,
        notas: valores.notas.trim() === '' ? null : valores.notas.trim(),
      };

      if (registro) {
        await actualizarRegistroEjercicio(registro.id, datos);
      } else {
        await crearRegistroEjercicio(datos);
      }
      onOpenChange(false);
    } catch (error) {
      form.setError('root', { message: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{registro ? 'Editar registro' : 'Nuevo registro'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="fecha"
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

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {TIPOS.map(({ valor, etiqueta }) => (
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
                    {NOMBRES_ICONOS_FITNESS.map((nombre) => {
                      const Icono = ICONOS_FITNESS[nombre as NombreIconoFitness];
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

            {tipo === 'fuerza' && (
              <>
                <FormField
                  control={form.control}
                  name="nombreEjercicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ejercicio</FormLabel>
                      <FormControl>
                        <Input placeholder="Press de banca" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Series</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => camposSeries.append({ repeticiones: '', pesoKg: '' })}
                    >
                      <Plus /> Agregar serie
                    </Button>
                  </div>
                  {camposSeries.fields.map((campo, index) => (
                    <div key={campo.id} className="grid grid-cols-[3rem_1fr_1fr_auto] items-start gap-2">
                      <span className="pt-2 text-sm text-muted-foreground">#{index + 1}</span>
                      <FormField
                        control={form.control}
                        name={`seriesRealizadas.${index}.repeticiones`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input inputMode="numeric" placeholder="Reps" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`seriesRealizadas.${index}.pesoKg`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input inputMode="decimal" placeholder="Peso (kg)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => camposSeries.remove(index)}
                        disabled={camposSeries.fields.length === 1}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                  {form.formState.errors.seriesRealizadas?.root?.message && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.seriesRealizadas.root.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {tipo === 'triserie_core' && (
              <div className="flex flex-col gap-2">
                <FormLabel>Ejercicios de la triserie</FormLabel>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="grid grid-cols-[1fr_4.5rem_4.5rem] items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`ejerciciosTriserie.${i}.nombre`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder={`Ejercicio ${i + 1}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ejerciciosTriserie.${i}.series`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input inputMode="numeric" placeholder="Series" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ejerciciosTriserie.${i}.repeticiones`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input inputMode="numeric" placeholder="Reps" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            )}

            {tipo === 'cardio' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duracionMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (min)</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distanciaKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distancia (km, opcional)</FormLabel>
                      <FormControl>
                        <Input inputMode="decimal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

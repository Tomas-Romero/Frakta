import { useEffect } from 'react';
import { useFieldArray, useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ban, Plus, Trash2 } from 'lucide-react';
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
import { parseNumeroAr } from '@/lib/numeroAr';
import { crearRutina, actualizarRutina } from '@/db/repositorios/rutinas';
import { DIAS, ETIQUETA_DIA } from '@/features/horario/layoutSemana';
import { ICONOS_FITNESS, NOMBRES_ICONOS_FITNESS, type NombreIconoFitness } from './iconosFitness';
import type { Rutina } from '@/types/models';

const SIN_ICONO = '__ninguno__';

const diaSemanaSchema = z.enum([
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo',
]);

const ejercicioPlanificadoSchema = z.object({
  nombre: z.string().trim().min(1, 'Nombre requerido'),
  seriesObjetivo: z.string().min(1, 'Requerido'),
  repeticionesObjetivo: z.string().min(1, 'Requerido'),
  icono: z.string(),
});

const diaRutinaSchema = z.object({
  dia: diaSemanaSchema,
  foco: z.string(),
  ejercicios: z.array(ejercicioPlanificadoSchema),
});

const esquemaFormulario = z.object({
  nombre: z.string().trim().min(1, 'Ingresá un nombre'),
  dias: z.array(diaRutinaSchema).length(7),
});

type ValoresFormulario = z.infer<typeof esquemaFormulario>;

function valoresPorDefecto(rutina?: Rutina): ValoresFormulario {
  if (!rutina) {
    return {
      nombre: '',
      dias: DIAS.map((dia) => ({ dia, foco: '', ejercicios: [] })),
    };
  }
  return {
    nombre: rutina.nombre,
    dias: rutina.dias.map((d) => ({
      dia: d.dia,
      foco: d.foco,
      ejercicios: d.ejercicios.map((e) => ({
        nombre: e.nombre,
        seriesObjetivo: String(e.seriesObjetivo),
        repeticionesObjetivo: String(e.repeticionesObjetivo),
        icono: e.icono ?? SIN_ICONO,
      })),
    })),
  };
}

interface RutinaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rutina?: Rutina;
}

export function RutinaForm({ open, onOpenChange, rutina }: RutinaFormProps) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresPorDefecto(rutina),
  });

  useEffect(() => {
    if (open) form.reset(valoresPorDefecto(rutina));
  }, [open, rutina, form]);

  async function onSubmit(valores: ValoresFormulario) {
    try {
      const datos = {
        nombre: valores.nombre,
        dias: valores.dias.map((d) => ({
          dia: d.dia,
          foco: d.foco.trim(),
          ejercicios: d.ejercicios.map((e) => ({
            nombre: e.nombre.trim(),
            seriesObjetivo: Math.trunc(parseNumeroAr(e.seriesObjetivo)),
            repeticionesObjetivo: Math.trunc(parseNumeroAr(e.repeticionesObjetivo)),
            icono: e.icono === SIN_ICONO ? null : e.icono,
          })),
        })),
        activa: rutina?.activa ?? false,
      };

      if (rutina) {
        await actualizarRutina(rutina.id, datos);
      } else {
        await crearRutina(datos);
      }
      onOpenChange(false);
    } catch (error) {
      form.setError('root', { message: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{rutina ? 'Editar rutina' : 'Nueva rutina'}</DialogTitle>
          <DialogDescription>
            Un split de 5 días de entrenamiento — dejá el foco vacío o escribí "Descanso" en los
            días que no entrenás.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la rutina</FormLabel>
                  <FormControl>
                    <Input placeholder="Split de 5 días" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3">
              {DIAS.map((dia, index) => (
                <DiaRutinaFields
                  key={dia}
                  control={form.control}
                  diaIndex={index}
                  etiqueta={ETIQUETA_DIA[dia]}
                />
              ))}
            </div>

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

interface DiaRutinaFieldsProps {
  control: Control<ValoresFormulario>;
  diaIndex: number;
  etiqueta: string;
}

function DiaRutinaFields({ control, diaIndex, etiqueta }: DiaRutinaFieldsProps) {
  const campos = useFieldArray({ control, name: `dias.${diaIndex}.ejercicios` });

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="w-24 shrink-0 text-sm font-medium">{etiqueta}</span>
        <FormField
          control={control}
          name={`dias.${diaIndex}.foco`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="sr-only">Foco de {etiqueta}</FormLabel>
              <FormControl>
                <Input placeholder="Foco (ej. Pecho y tríceps, Descanso)" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        {campos.fields.map((campo, index) => (
          <div
            key={campo.id}
            className="grid grid-cols-[5.5rem_1fr_4.5rem_4.5rem_auto] items-start gap-2"
          >
            <FormField
              control={control}
              name={`dias.${diaIndex}.ejercicios.${index}.icono`}
              render={({ field }) => (
                <FormItem>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SIN_ICONO}>
                        <span className="flex items-center gap-2">
                          <Ban className="size-4" /> Sin ícono
                        </span>
                      </SelectItem>
                      {NOMBRES_ICONOS_FITNESS.map((nombre) => {
                        const Icono = ICONOS_FITNESS[nombre as NombreIconoFitness];
                        return (
                          <SelectItem key={nombre} value={nombre}>
                            <span className="flex items-center gap-2">
                              <Icono className="size-4" /> {nombre}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`dias.${diaIndex}.ejercicios.${index}.nombre`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Press de banca" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`dias.${diaIndex}.ejercicios.${index}.seriesObjetivo`}
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
              control={control}
              name={`dias.${diaIndex}.ejercicios.${index}.repeticionesObjetivo`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input inputMode="numeric" placeholder="Reps" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => campos.remove(index)}>
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() =>
            campos.append({ nombre: '', seriesObjetivo: '', repeticionesObjetivo: '', icono: SIN_ICONO })
          }
        >
          <Plus /> Agregar ejercicio
        </Button>
      </div>
    </div>
  );
}

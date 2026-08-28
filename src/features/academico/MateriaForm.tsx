import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { parseNumeroAr, formatNumeroAr } from '@/lib/numeroAr';
import { crearMateria, actualizarMateria } from '@/db/repositorios/materias';
import type { ConfigApp } from '@/db/db';
import type { EstadoMateria, Materia } from '@/types/models';

const ESTADOS: EstadoMateria[] = ['PorCursar', 'Cursando', 'Regular', 'Aprobado'];

const esquemaFormulario = z.object({
  nombre: z.string().trim().min(1, 'Ingresá un nombre'),
  anioCursado: z.string().min(1, 'Requerido'),
  cargaHorariaSemanal: z.string().min(1, 'Requerido'),
  cargaHorariaTotal: z.string().min(1, 'Requerido'),
  estado: z.enum(['PorCursar', 'Cursando', 'Regular', 'Aprobado']),
  nota: z.string(),
  pesoFinal: z.string().min(1, 'Requerido'),
  correlativas: z.array(z.string()),
  parciales: z.array(
    z.object({
      nombre: z.string().trim().min(1, 'Nombre requerido'),
      nota: z.string(),
      peso: z.string().min(1, 'Requerido'),
    }),
  ),
});

type ValoresFormulario = z.infer<typeof esquemaFormulario>;

function valoresPorDefecto(materia?: Materia): ValoresFormulario {
  if (!materia) {
    return {
      nombre: '',
      anioCursado: '1',
      cargaHorariaSemanal: '',
      cargaHorariaTotal: '',
      estado: 'PorCursar',
      nota: '',
      pesoFinal: '1',
      correlativas: [],
      parciales: [],
    };
  }
  return {
    nombre: materia.nombre,
    anioCursado: String(materia.anioCursado),
    cargaHorariaSemanal: formatNumeroAr(materia.cargaHoraria.semanal),
    cargaHorariaTotal: formatNumeroAr(materia.cargaHoraria.total),
    estado: materia.estado,
    nota: materia.nota === null ? '' : formatNumeroAr(materia.nota),
    pesoFinal: formatNumeroAr(materia.pesoFinal),
    correlativas: materia.correlativas,
    parciales: materia.parciales.map((p) => ({
      nombre: p.nombre,
      nota: p.nota === null ? '' : formatNumeroAr(p.nota),
      peso: formatNumeroAr(p.peso),
    })),
  };
}

interface MateriaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materia?: Materia;
  materiasDisponibles: Materia[];
  escalaNotas: ConfigApp['escalaNotas'];
}

export function MateriaForm({
  open,
  onOpenChange,
  materia,
  materiasDisponibles,
  escalaNotas,
}: MateriaFormProps) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresPorDefecto(materia),
  });

  const camposParciales = useFieldArray({ control: form.control, name: 'parciales' });

  useEffect(() => {
    if (open) form.reset(valoresPorDefecto(materia));
  }, [open, materia, form]);

  const maximoNota = escalaNotas === '0-100' ? 100 : 10;

  async function onSubmit(valores: ValoresFormulario) {
    try {
      const datos = {
        nombre: valores.nombre,
        anioCursado: Math.trunc(parseNumeroAr(valores.anioCursado)),
        cargaHoraria: {
          semanal: parseNumeroAr(valores.cargaHorariaSemanal),
          total: parseNumeroAr(valores.cargaHorariaTotal),
        },
        estado: valores.estado,
        nota: valores.nota.trim() === '' ? null : parseNumeroAr(valores.nota),
        pesoFinal: parseNumeroAr(valores.pesoFinal),
        correlativas: valores.correlativas,
        parciales: valores.parciales.map((p) => ({
          nombre: p.nombre,
          nota: p.nota.trim() === '' ? null : parseNumeroAr(p.nota),
          peso: parseNumeroAr(p.peso),
        })),
      };

      if (datos.nota !== null && (datos.nota < 0 || datos.nota > maximoNota)) {
        form.setError('nota', { message: `Debe estar entre 0 y ${maximoNota}` });
        return;
      }
      if (datos.pesoFinal < 0 || datos.pesoFinal > 1) {
        form.setError('pesoFinal', { message: 'Debe estar entre 0 y 1' });
        return;
      }

      if (materia) {
        await actualizarMateria(materia.id, datos);
      } else {
        await crearMateria(datos);
      }
      onOpenChange(false);
    } catch (error) {
      form.setError('root', { message: (error as Error).message });
    }
  }

  const correlativasPosibles = materiasDisponibles.filter((m) => m.id !== materia?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{materia ? 'Editar materia' : 'Nueva materia'}</DialogTitle>
          <DialogDescription>
            Cargá los datos de la materia. Notas y pesos en formato Argentina (coma decimal).
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
                    <Input placeholder="Análisis Matemático I" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="anioCursado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargaHorariaSemanal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hs/semana</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargaHorariaTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas totales</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ESTADOS.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nota (0-{maximoNota})</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="—" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pesoFinal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso final (0-1)</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {correlativasPosibles.length > 0 && (
              <FormField
                control={form.control}
                name="correlativas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correlativas</FormLabel>
                    <div className="grid max-h-36 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3">
                      {correlativasPosibles.map((m) => (
                        <label key={m.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={field.value.includes(m.id)}
                            onCheckedChange={(marcado) => {
                              field.onChange(
                                marcado
                                  ? [...field.value, m.id]
                                  : field.value.filter((id) => id !== m.id),
                              );
                            }}
                          />
                          {m.nombre}
                        </label>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <FormLabel>Parciales</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => camposParciales.append({ nombre: '', nota: '', peso: '' })}
                >
                  <Plus /> Agregar parcial
                </Button>
              </div>
              {camposParciales.fields.map((campo, index) => (
                <div key={campo.id} className="grid grid-cols-[1fr_5rem_5rem_auto] items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`parciales.${index}.nombre`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Primer parcial" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`parciales.${index}.nota`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input inputMode="decimal" placeholder="Nota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`parciales.${index}.peso`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input inputMode="decimal" placeholder="Peso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => camposParciales.remove(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
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

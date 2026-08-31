import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ban } from 'lucide-react';
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
import { crearBloque, actualizarBloque } from '@/db/repositorios/bloquesHorario';
import { textoAMinutos, minutosATexto, DIAS, ETIQUETA_DIA } from './layoutSemana';
import { ICONOS_ACTIVIDAD, NOMBRES_ICONOS_ACTIVIDAD, type NombreIconoActividad } from './iconosActividad';
import type { BloqueHorario, DiaSemana, Materia } from '@/types/models';

const PALETA_COLORES = [
  '#2c4a9e', '#2f8f5b', '#b1791a', '#8b3ba0', '#c0392b', '#1a8b8b',
];

const SIN_ICONO = '__ninguno__';

const esquemaFormulario = z
  .object({
    modo: z.enum(['materia', 'actividad']),
    materiaId: z.string(),
    titulo: z.string(),
    icono: z.string(),
    dia: z.enum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']),
    horaInicio: z.string().min(1, 'Requerido'),
    horaFin: z.string().min(1, 'Requerido'),
    aula: z.string(),
    color: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.modo === 'materia' && v.materiaId.trim() === '') {
      ctx.addIssue({ code: 'custom', path: ['materiaId'], message: 'Elegí una materia' });
    }
    if (v.modo === 'actividad' && v.titulo.trim() === '') {
      ctx.addIssue({ code: 'custom', path: ['titulo'], message: 'Ingresá un nombre' });
    }
    if (textoAMinutos(v.horaFin) <= textoAMinutos(v.horaInicio)) {
      ctx.addIssue({
        code: 'custom',
        path: ['horaFin'],
        message: 'Debe ser posterior a la hora de inicio',
      });
    }
  });

type ValoresFormulario = z.infer<typeof esquemaFormulario>;

function valoresPorDefecto(
  bloque?: BloqueHorario,
  diaPorDefecto?: DiaSemana,
  horaInicioPorDefecto?: number,
): ValoresFormulario {
  if (!bloque) {
    const inicio = horaInicioPorDefecto ?? 8 * 60;
    return {
      modo: 'materia',
      materiaId: '',
      titulo: '',
      icono: SIN_ICONO,
      dia: diaPorDefecto ?? 'lunes',
      horaInicio: minutosATexto(inicio),
      horaFin: minutosATexto(inicio + 90),
      aula: '',
      color: PALETA_COLORES[0],
    };
  }
  return {
    modo: bloque.materiaId ? 'materia' : 'actividad',
    materiaId: bloque.materiaId ?? '',
    titulo: bloque.titulo ?? '',
    icono: bloque.icono ?? SIN_ICONO,
    dia: bloque.dia,
    horaInicio: minutosATexto(bloque.horaInicioMin),
    horaFin: minutosATexto(bloque.horaFinMin),
    aula: bloque.aula ?? '',
    color: bloque.color,
  };
}

interface BloqueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bloque?: BloqueHorario;
  diaPorDefecto?: DiaSemana;
  horaInicioPorDefecto?: number;
  materias: Materia[];
  onEliminar?: (bloque: BloqueHorario) => void;
}

export function BloqueForm({
  open,
  onOpenChange,
  bloque,
  diaPorDefecto,
  horaInicioPorDefecto,
  materias,
  onEliminar,
}: BloqueFormProps) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresPorDefecto(bloque, diaPorDefecto, horaInicioPorDefecto),
  });

  useEffect(() => {
    if (open) form.reset(valoresPorDefecto(bloque, diaPorDefecto, horaInicioPorDefecto));
  }, [open, bloque, diaPorDefecto, horaInicioPorDefecto, form]);

  const modo = form.watch('modo');

  async function onSubmit(valores: ValoresFormulario) {
    const datos = {
      materiaId: valores.modo === 'materia' ? valores.materiaId : null,
      titulo: valores.modo === 'actividad' ? valores.titulo.trim() : null,
      icono: valores.icono === SIN_ICONO ? null : valores.icono,
      dia: valores.dia,
      horaInicioMin: textoAMinutos(valores.horaInicio),
      horaFinMin: textoAMinutos(valores.horaFin),
      aula: valores.aula.trim() === '' ? undefined : valores.aula.trim(),
      color: valores.color,
    };

    if (bloque) {
      await actualizarBloque(bloque.id, datos);
    } else {
      await crearBloque(datos);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bloque ? 'Editar bloque' : 'Nuevo bloque de horario'}</DialogTitle>
          <DialogDescription>
            La fusión visual de horarios superpuestos se calcula sola — no hace falta nada
            especial acá.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="modo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Qué es este bloque?</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange('materia')}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm',
                        field.value === 'materia'
                          ? 'border-primary bg-accent text-accent-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      Una materia
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('actividad')}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm',
                        field.value === 'actividad'
                          ? 'border-primary bg-accent text-accent-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      Otra actividad
                    </button>
                  </div>
                </FormItem>
              )}
            />

            {modo === 'materia' ? (
              <FormField
                control={form.control}
                name="materiaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materia</FormLabel>
                    {materias.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No tenés materias cargadas todavía — creá una desde Académico, o elegí
                        "Otra actividad" arriba.
                      </p>
                    ) : (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Elegí una materia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materias.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la actividad</FormLabel>
                    <FormControl>
                      <Input placeholder="Gimnasio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                    {NOMBRES_ICONOS_ACTIVIDAD.map((nombre) => {
                      const Icono = ICONOS_ACTIVIDAD[nombre as NombreIconoActividad];
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
              name="dia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Día</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DIAS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {ETIQUETA_DIA[d]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="horaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desde</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="horaFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasta</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="aula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lugar (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Aula 12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {PALETA_COLORES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          aria-label={color}
                          onClick={() => field.onChange(color)}
                          className="size-6 rounded-full ring-offset-2 outline-none"
                          style={{
                            background: color,
                            boxShadow: field.value === color ? `0 0 0 2px ${color}` : undefined,
                          }}
                        />
                      ))}
                      <Input
                        type="color"
                        className="h-7 w-9 p-0.5"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="justify-between sm:justify-between">
              {bloque && onEliminar ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    onEliminar(bloque);
                    onOpenChange(false);
                  }}
                >
                  Eliminar
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Guardar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

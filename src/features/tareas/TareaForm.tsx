import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
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
import { crearTarea, actualizarTarea } from '@/db/repositorios/tareas';
import type { Materia, Prioridad, Proyecto, Tarea, TipoTarea } from '@/types/models';

const TIPOS: TipoTarea[] = ['academica', 'personal', 'proyecto', 'idea'];
const PRIORIDADES: Prioridad[] = ['alta', 'media', 'baja'];
const SIN_ASIGNAR = '__ninguno__';

const esquemaFormulario = z.object({
  titulo: z.string().trim().min(1, 'Ingresá un título'),
  tipo: z.enum(['academica', 'personal', 'proyecto', 'idea']),
  proyectoId: z.string(),
  prioridad: z.enum(['alta', 'media', 'baja']),
  fechaLimite: z.string(),
  materiaId: z.string(),
});

type ValoresFormulario = z.infer<typeof esquemaFormulario>;

function valoresPorDefecto(tarea?: Tarea): ValoresFormulario {
  if (!tarea) {
    return {
      titulo: '',
      tipo: 'personal',
      proyectoId: SIN_ASIGNAR,
      prioridad: 'media',
      fechaLimite: '',
      materiaId: SIN_ASIGNAR,
    };
  }
  return {
    titulo: tarea.titulo,
    tipo: tarea.tipo,
    proyectoId: tarea.proyectoId ?? SIN_ASIGNAR,
    prioridad: tarea.prioridad,
    fechaLimite: tarea.fechaLimite ?? '',
    materiaId: tarea.materiaId ?? SIN_ASIGNAR,
  };
}

interface TareaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarea?: Tarea;
  proyectos: Proyecto[];
  materias: Materia[];
}

export function TareaForm({ open, onOpenChange, tarea, proyectos, materias }: TareaFormProps) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresPorDefecto(tarea),
  });

  useEffect(() => {
    if (open) form.reset(valoresPorDefecto(tarea));
  }, [open, tarea, form]);

  const tipo = form.watch('tipo');

  async function onSubmit(valores: ValoresFormulario) {
    const datos = {
      titulo: valores.titulo,
      tipo: valores.tipo,
      proyectoId: valores.proyectoId === SIN_ASIGNAR ? null : valores.proyectoId,
      prioridad: valores.prioridad,
      fechaLimite: valores.fechaLimite.trim() === '' ? null : valores.fechaLimite,
      materiaId: valores.tipo === 'academica' && valores.materiaId !== SIN_ASIGNAR
        ? valores.materiaId
        : null,
      estado: tarea?.estado ?? ('por_hacer' as const),
    };

    if (tarea) {
      await actualizarTarea(tarea.id, datos);
    } else {
      await crearTarea(datos);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tarea ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Entregar informe de laboratorio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prioridad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORIDADES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {tipo === 'academica' && materias.length > 0 && (
              <FormField
                control={form.control}
                name="materiaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materia</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SIN_ASIGNAR}>Sin materia</SelectItem>
                        {materias.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            {proyectos.length > 0 && (
              <FormField
                control={form.control}
                name="proyectoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proyecto (opcional)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SIN_ASIGNAR}>Sin proyecto</SelectItem>
                        {proyectos.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="fechaLimite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha límite (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

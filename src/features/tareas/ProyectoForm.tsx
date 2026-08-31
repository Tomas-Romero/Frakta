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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { crearProyecto, actualizarProyecto } from '@/db/repositorios/proyectos';
import type { Proyecto } from '@/types/models';

const esquemaFormulario = z.object({
  nombre: z.string().trim().min(1, 'Ingresá un nombre'),
  descripcion: z.string(),
});

type ValoresFormulario = z.infer<typeof esquemaFormulario>;

function valoresPorDefecto(proyecto?: Proyecto): ValoresFormulario {
  return { nombre: proyecto?.nombre ?? '', descripcion: proyecto?.descripcion ?? '' };
}

interface ProyectoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proyecto?: Proyecto;
  /** Se dispara con el proyecto recién creado o editado — útil para
   * auto-seleccionarlo en otro formulario (ej. al crearlo desde Tareas). */
  onGuardado?: (proyecto: Proyecto) => void;
}

export function ProyectoForm({ open, onOpenChange, proyecto, onGuardado }: ProyectoFormProps) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresPorDefecto(proyecto),
  });

  useEffect(() => {
    if (open) form.reset(valoresPorDefecto(proyecto));
  }, [open, proyecto, form]);

  async function onSubmit(valores: ValoresFormulario) {
    const datos = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim() === '' ? undefined : valores.descripcion.trim(),
    };

    let guardado: Proyecto;
    if (proyecto) {
      await actualizarProyecto(proyecto.id, datos);
      guardado = { ...proyecto, ...datos };
    } else {
      guardado = await crearProyecto(datos);
    }
    onOpenChange(false);
    onGuardado?.(guardado);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{proyecto ? 'Editar proyecto' : 'Nuevo proyecto'}</DialogTitle>
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
                    <Input placeholder="Freelance - landing de un cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
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

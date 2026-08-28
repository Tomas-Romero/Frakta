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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { parseNumeroAr, formatNumeroAr } from '@/lib/numeroAr';
import { crearSuscripcion, actualizarSuscripcion } from '@/db/repositorios/suscripciones';
import type { SuscripcionRecurrente } from '@/types/models';

const esquemaFormulario = z.object({
  nombre: z.string().trim().min(1, 'Ingresá un nombre'),
  monto: z.string().min(1, 'Requerido'),
  diaDelMes: z.string().min(1, 'Requerido'),
  categoria: z.string().trim().min(1, 'Ingresá una categoría'),
  activa: z.boolean(),
});

type ValoresFormulario = z.infer<typeof esquemaFormulario>;

function valoresPorDefecto(suscripcion?: SuscripcionRecurrente): ValoresFormulario {
  if (!suscripcion) {
    return { nombre: '', monto: '', diaDelMes: '1', categoria: '', activa: true };
  }
  return {
    nombre: suscripcion.nombre,
    monto: formatNumeroAr(suscripcion.monto),
    diaDelMes: String(suscripcion.diaDelMes),
    categoria: suscripcion.categoria,
    activa: suscripcion.activa,
  };
}

interface SuscripcionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suscripcion?: SuscripcionRecurrente;
  categoriasSugeridas: string[];
}

export function SuscripcionForm({
  open,
  onOpenChange,
  suscripcion,
  categoriasSugeridas,
}: SuscripcionFormProps) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresPorDefecto(suscripcion),
  });

  useEffect(() => {
    if (open) form.reset(valoresPorDefecto(suscripcion));
  }, [open, suscripcion, form]);

  async function onSubmit(valores: ValoresFormulario) {
    let monto: number;
    let diaDelMes: number;
    try {
      monto = parseNumeroAr(valores.monto);
      diaDelMes = Math.trunc(parseNumeroAr(valores.diaDelMes));
    } catch {
      form.setError('monto', { message: 'Revisá los números ingresados' });
      return;
    }
    if (monto <= 0) {
      form.setError('monto', { message: 'Debe ser mayor a 0' });
      return;
    }
    if (diaDelMes < 1 || diaDelMes > 31) {
      form.setError('diaDelMes', { message: 'Debe estar entre 1 y 31' });
      return;
    }

    const datos = {
      nombre: valores.nombre.trim(),
      monto,
      diaDelMes,
      categoria: valores.categoria.trim(),
      activa: valores.activa,
    };

    if (suscripcion) {
      await actualizarSuscripcion(suscripcion.id, datos);
    } else {
      await crearSuscripcion(datos);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{suscripcion ? 'Editar suscripción' : 'Nueva suscripción'}</DialogTitle>
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
                    <Input placeholder="Netflix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto mensual</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="diaDelMes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día del mes</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input list="categorias-sugeridas-susc" placeholder="Servicios" {...field} />
                  </FormControl>
                  <datalist id="categorias-sugeridas-susc">
                    {categoriasSugeridas.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activa"
              render={({ field }) => (
                <FormItem>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    Activa
                  </label>
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

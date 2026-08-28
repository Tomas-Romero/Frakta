import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { parseNumeroAr, formatNumeroAr } from '@/lib/numeroAr';
import { crearMovimiento, actualizarMovimiento } from '@/db/repositorios/movimientos';
import type { MovimientoFinanciero, TipoMovimiento } from '@/types/models';

const esquemaFormulario = z.object({
  tipo: z.enum(['gasto', 'ingreso']),
  monto: z.string().min(1, 'Requerido'),
  categoria: z.string().trim().min(1, 'Ingresá una categoría'),
  fecha: z.string().min(1, 'Requerido'),
  descripcion: z.string(),
});

type ValoresFormulario = z.infer<typeof esquemaFormulario>;

function valoresPorDefecto(movimiento?: MovimientoFinanciero): ValoresFormulario {
  if (!movimiento) {
    return {
      tipo: 'gasto',
      monto: '',
      categoria: '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      descripcion: '',
    };
  }
  return {
    tipo: movimiento.tipo,
    monto: formatNumeroAr(movimiento.monto),
    categoria: movimiento.categoria,
    fecha: movimiento.fecha,
    descripcion: movimiento.descripcion,
  };
}

interface MovimientoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimiento?: MovimientoFinanciero;
  categoriasSugeridas: string[];
}

export function MovimientoForm({
  open,
  onOpenChange,
  movimiento,
  categoriasSugeridas,
}: MovimientoFormProps) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresPorDefecto(movimiento),
  });

  useEffect(() => {
    if (open) form.reset(valoresPorDefecto(movimiento));
  }, [open, movimiento, form]);

  const tipo = form.watch('tipo');

  async function onSubmit(valores: ValoresFormulario) {
    let monto: number;
    try {
      monto = parseNumeroAr(valores.monto);
    } catch {
      form.setError('monto', { message: 'Ingresá un número válido' });
      return;
    }
    if (monto <= 0) {
      form.setError('monto', { message: 'Debe ser mayor a 0' });
      return;
    }

    const datos = {
      tipo: valores.tipo,
      monto,
      categoria: valores.categoria.trim(),
      fecha: valores.fecha,
      descripcion: valores.descripcion.trim(),
    };

    if (movimiento) {
      await actualizarMovimiento(movimiento.id, datos);
    } else {
      await crearMovimiento(datos);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{movimiento ? 'Editar movimiento' : 'Nuevo movimiento'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {(['gasto', 'ingreso'] as TipoMovimiento[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => field.onChange(t)}
                        className={cn(
                          'rounded-md border px-3 py-1.5 text-sm capitalize',
                          field.value === t
                            ? t === 'gasto'
                              ? 'border-destructive bg-destructive/10 text-destructive'
                              : 'border-emerald-600 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
                            : 'text-muted-foreground',
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input
                      list="categorias-sugeridas"
                      placeholder={tipo === 'gasto' ? 'Alimentación' : 'Sueldo'}
                      {...field}
                    />
                  </FormControl>
                  <datalist id="categorias-sugeridas">
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
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
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

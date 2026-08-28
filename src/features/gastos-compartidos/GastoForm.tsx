import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { parseNumeroAr } from '@/lib/numeroAr';
import { agregarGasto, actualizarGasto } from '@/db/repositorios/eventosCompartidos';
import type { GastoItem, Participante } from '@/types/models';

const esquemaFormulario = z.object({
  descripcion: z.string().trim().min(1, 'Ingresá una descripción'),
  monto: z.string().min(1, 'Requerido'),
  pagadoPor: z.array(z.string()).min(1, 'Elegí quién pagó'),
  participantes: z.array(z.string()).min(1, 'Elegí quién participa'),
});

type ValoresFormulario = z.infer<typeof esquemaFormulario>;

function valoresPorDefecto(
  participantesEvento: Participante[],
  gasto?: GastoItem,
): ValoresFormulario {
  if (!gasto) {
    return {
      descripcion: '',
      monto: '',
      pagadoPor: [],
      participantes: participantesEvento.map((p) => p.id),
    };
  }
  return {
    descripcion: gasto.descripcion,
    monto: String(gasto.monto).replace('.', ','),
    pagadoPor: gasto.pagadoPor,
    participantes: gasto.participantes,
  };
}

interface GastoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventoId: string;
  participantesEvento: Participante[];
  gasto?: GastoItem;
}

export function GastoForm({
  open,
  onOpenChange,
  eventoId,
  participantesEvento,
  gasto,
}: GastoFormProps) {
  const form = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresPorDefecto(participantesEvento, gasto),
  });

  useEffect(() => {
    if (open) form.reset(valoresPorDefecto(participantesEvento, gasto));
  }, [open, gasto, participantesEvento, form]);

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
      descripcion: valores.descripcion.trim(),
      monto,
      pagadoPor: valores.pagadoPor,
      participantes: valores.participantes,
    };

    if (gasto) {
      await actualizarGasto(eventoId, gasto.id, datos);
    } else {
      await agregarGasto(eventoId, datos);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{gasto ? 'Editar gasto' : 'Nuevo gasto'}</DialogTitle>
          <DialogDescription>
            Excluir a alguien de este gasto puntual es simplemente no tildarlo en
            "Participantes".
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Carne y verdura" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="pagadoPor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Quién pagó?</FormLabel>
                  <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                    {participantesEvento.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={field.value.includes(p.id)}
                          onCheckedChange={(marcado) => {
                            field.onChange(
                              marcado
                                ? [...field.value, p.id]
                                : field.value.filter((id) => id !== p.id),
                            );
                          }}
                        />
                        {p.nombre}
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participantes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participantes (quién lo consume)</FormLabel>
                  <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                    {participantesEvento.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={field.value.includes(p.id)}
                          onCheckedChange={(marcado) => {
                            field.onChange(
                              marcado
                                ? [...field.value, p.id]
                                : field.value.filter((id) => id !== p.id),
                            );
                          }}
                        />
                        {p.nombre}
                      </label>
                    ))}
                  </div>
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

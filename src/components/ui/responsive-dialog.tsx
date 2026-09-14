import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Centrado en desktop, hoja deslizante desde abajo en mobile (<768px) — mismo
// primitivo Radix debajo de Dialog y Sheet, así que alternar entre los dos es
// un simple pick según viewport. Ver docs/BLUEPRINT.md sección 10.
// Pensado para el caso de uso real de la app: un formulario con
// <DialogHeader>/<form>/<DialogFooter> como hijos directos — el swap desde
// Dialog/DialogContent/etc. es mecánico, sin reestructurar el JSX de cada
// formulario.
//
// `useIsMobile()` se resuelve UNA sola vez acá y se comparte por contexto —
// si cada subcomponente (Header/Content/Footer/Title/...) llamara al hook
// por su cuenta, un solo diálogo abierto terminaría registrando 5-6
// listeners de matchMedia en vez de uno.

const EsMobileContext = React.createContext(false);

function ResponsiveDialog(props: React.ComponentProps<typeof Dialog>) {
  const esMobile = useIsMobile();
  return (
    <EsMobileContext.Provider value={esMobile}>
      {esMobile ? <Sheet {...props} /> : <Dialog {...props} />}
    </EsMobileContext.Provider>
  );
}

function ResponsiveDialogTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
  const esMobile = React.useContext(EsMobileContext);
  return esMobile ? <SheetTrigger {...props} /> : <DialogTrigger {...props} />;
}

function ResponsiveDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const esMobile = React.useContext(EsMobileContext);
  return esMobile ? (
    <SheetContent
      side="bottom"
      className={cn(
        // SheetHeader/SheetFooter ya traen su propio p-4 — cualquier OTRO
        // hijo directo (el <form>/<div> con los campos) es "el cuerpo" y no
        // trae padding propio en Sheet (a diferencia de Dialog), así que se
        // lo damos acá sin tocar el JSX de cada formulario.
        "max-h-[90vh] overflow-y-auto rounded-t-xl [&>*:not([data-slot='sheet-header']):not([data-slot='sheet-footer'])]:px-4 [&>*:not([data-slot='sheet-header']):not([data-slot='sheet-footer'])]:pb-4",
        className,
      )}
      {...props}
    />
  ) : (
    <DialogContent className={cn('max-h-[85vh] overflow-y-auto', className)} {...props} />
  );
}

function ResponsiveDialogHeader(props: React.ComponentProps<'div'>) {
  const esMobile = React.useContext(EsMobileContext);
  return esMobile ? <SheetHeader {...props} /> : <DialogHeader {...props} />;
}

function ResponsiveDialogFooter(props: React.ComponentProps<'div'>) {
  const esMobile = React.useContext(EsMobileContext);
  return esMobile ? <SheetFooter {...props} /> : <DialogFooter {...props} />;
}

function ResponsiveDialogTitle(props: React.ComponentProps<typeof DialogTitle>) {
  const esMobile = React.useContext(EsMobileContext);
  return esMobile ? <SheetTitle {...props} /> : <DialogTitle {...props} />;
}

function ResponsiveDialogDescription(props: React.ComponentProps<typeof DialogDescription>) {
  const esMobile = React.useContext(EsMobileContext);
  return esMobile ? <SheetDescription {...props} /> : <DialogDescription {...props} />;
}

function ResponsiveDialogClose(props: React.ComponentProps<typeof DialogClose>) {
  const esMobile = React.useContext(EsMobileContext);
  return esMobile ? <SheetClose {...props} /> : <DialogClose {...props} />;
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogClose,
};

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DEMO_TOUR_STEPS } from "@/config/demo-tour-steps";
import { useDemoTourStore } from "@/store/demo-tour-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HIGHLIGHT_CLASS = "demo-tour-highlight";

function pathMatches(pathname: string, stepPath: string) {
  return pathname === stepPath || pathname.startsWith(`${stepPath}/`);
}

function stripMarkdownBold(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export function DemoTourPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const active = useDemoTourStore((s) => s.active);
  const stepIndex = useDemoTourStore((s) => s.stepIndex);
  const events = useDemoTourStore((s) => s.events);
  const stop = useDemoTourStore((s) => s.stop);
  const next = useDemoTourStore((s) => s.next);
  const prev = useDemoTourStore((s) => s.prev);
  const goToStep = useDemoTourStore((s) => s.goToStep);

  const step = DEMO_TOUR_STEPS[stepIndex];
  const isLast = stepIndex >= DEMO_TOUR_STEPS.length - 1;

  const eventOk = !step?.waitEvent || events.has(step.waitEvent);
  const pathOk = !step?.completeOnPath || pathname.startsWith(step.completeOnPath);

  const canAdvance =
    !step?.waitEvent || events.has(step.waitEvent);

  useEffect(() => {
    if (!active || !step) return;
    if (pathMatches(pathname, step.path)) return;
    if (step.completeOnPath && pathname.startsWith(step.completeOnPath)) return;
    router.push(step.path);
  }, [active, stepIndex, step, pathname, router]);

  useEffect(() => {
    if (!active || step?.id !== "equipment-search") return;
    if (pathname.startsWith("/products/prod-1")) {
      const t = setTimeout(() => next(), 450);
      return () => clearTimeout(t);
    }
  }, [pathname, active, step?.id, next]);

  useEffect(() => {
    if (!active || !step?.highlight) {
      document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
        el.classList.remove(HIGHLIGHT_CLASS);
      });
      return;
    }
    document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
      el.classList.remove(HIGHLIGHT_CLASS);
    });
    const el = document.querySelector(`[data-tour="${step.highlight}"]`);
    if (el) {
      el.classList.add(HIGHLIGHT_CLASS);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return () => {
      el?.classList.remove(HIGHLIGHT_CLASS);
    };
  }, [active, step?.highlight, stepIndex, pathname]);

  if (!active || !step) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] flex justify-center p-4 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto w-full max-w-lg rounded-2xl border border-primary/30 bg-card/95 p-5 shadow-2xl backdrop-blur-md",
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Recorrido guiado · {stepIndex + 1}/{DEMO_TOUR_STEPS.length}
            </p>
            <h2 className="text-base font-bold">{step.title}</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={stop} aria-label="Cerrar tour">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{stripMarkdownBold(step.instruction)}</p>

        {step.waitEvent && !eventOk && (
          <p className="mt-3 text-xs font-medium text-amber-700 bg-amber-500/10 rounded-md px-2 py-1.5">
            Realiza la acción indicada arriba; después podrás pulsar Siguiente.
          </p>
        )}
        {step.id === "equipment-search" && !pathOk && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-primary bg-primary/10 rounded-md px-2 py-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Abre el producto desde los resultados (tarjeta resaltada)
            </p>
            <Link
              href="/products/prod-1"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
            >
              Ir directo a Rodamiento SKF 6204
            </Link>
          </div>
        )}

        <div className="mt-2 flex gap-1">
          {DEMO_TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i === stepIndex ? "bg-primary" : i < stepIndex ? "bg-primary/40" : "bg-muted",
              )}
              onClick={() => goToStep(i)}
              aria-label={`Paso ${i + 1}`}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={stepIndex === 0} onClick={prev}>
            <ChevronLeft className="h-4 w-4" />
            Atrás
          </Button>
          {!isLast ? (
            <Button size="sm" onClick={next} disabled={!canAdvance} className="flex-1 sm:flex-none">
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={stop} className="flex-1 sm:flex-none">
              Finalizar tour
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={stop}>
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
}

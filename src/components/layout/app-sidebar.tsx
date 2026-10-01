"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation } from "@/config/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[17.5rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl">
      <div className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-md">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">InduSupply</p>
            <p className="text-[11px] text-sidebar-foreground/70">Ferretería industrial</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-5">
          {navigation.map((section) => (
            <div key={section.title}>
              {section.href ? (
                <Link
                  href={section.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    pathname === section.href
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  {section.icon && <section.icon className="h-4 w-4" />}
                  {section.title}
                </Link>
              ) : (
                <>
                  <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/45">
                    {section.title}
                  </p>
                  <ul className="space-y-0.5">
                    {section.children?.map((item) => {
                      const active =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-all",
                              active
                                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                            )}
                          >
                            {item.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-4 text-[10px] text-sidebar-foreground/50">
        Mock operacional · datos en localStorage
      </div>
    </aside>
  );
}

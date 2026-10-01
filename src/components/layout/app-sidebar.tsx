"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigation } from "@/config/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="border-b px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          InduSupply
        </p>
        <h1 className="text-lg font-semibold leading-tight">Centro operaciones</h1>
        <p className="text-xs text-muted-foreground mt-1">Ferretería industrial · Mock</p>
      </div>
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="space-y-4">
          {navigation.map((section) => (
            <div key={section.title}>
              {section.href ? (
                <Link
                  href={section.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === section.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60",
                  )}
                >
                  {section.icon && <section.icon className="h-4 w-4 opacity-70" />}
                  {section.title}
                </Link>
              ) : (
                <>
                  <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </p>
                  <ul className="space-y-0.5">
                    {section.children?.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-md px-3 py-1.5 text-sm transition-colors",
                            pathname === item.href || pathname.startsWith(item.href + "/")
                              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                          )}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}

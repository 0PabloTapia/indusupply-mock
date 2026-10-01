import { AppSidebar } from "@/components/layout/app-sidebar";
import { DemoTourPanel } from "@/components/demo/demo-tour-panel";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto pb-36">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
      </main>
      <DemoTourPanel />
    </div>
  );
}

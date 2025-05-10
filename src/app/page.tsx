import { MainWorkspace } from "@/components/newsletter-pro/main-workspace";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HomePage() {
  return (
    <SidebarProvider>
      <main>
        <MainWorkspace />
      </main>
    </SidebarProvider>
  );
}

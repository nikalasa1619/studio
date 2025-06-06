import { MainWorkspace } from "@/components/newsletter-pro/main-workspace";

export default function HomePage() {
  return (
    <main>
      <MainWorkspace />
      <div className="mt-4">
        <a href="/projects" className="text-blue-600 underline">Go to Projects</a>
      </div>
    </main>
  );
}

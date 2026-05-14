import { ApplicationWizard } from "@/components/wizard/ApplicationWizard";

export default function Home() {
  return (
    <main className="min-h-screen bg-app-base px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <ApplicationWizard />
    </main>
  );
}

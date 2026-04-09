import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
  /** If true, renders children without nav chrome (used for entry/auth pages) */
  bare?: boolean;
}

export function Layout({ children, bare = false }: LayoutProps) {
  if (bare) {
    return (
      <>
        <main className="min-h-screen bg-background text-foreground">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="bg-card border-t border-border py-3 px-6 text-center">
          <p className="text-muted-foreground text-xs font-body">
            © {new Date().getFullYear()} KLU Spotter · Smart Campus Occupancy.
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-smooth"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
      <Toaster richColors position="top-right" />
    </>
  );
}

import { ExternalLink, Github } from "lucide-react";

interface DemoCardProps {
  title: string;
  description: string;
  image: string;
  demoUrl: string;
  sourceUrl: string;
  comingSoon?: boolean;
}

export function DemoCard({
  title,
  description,
  image,
  demoUrl,
  sourceUrl,
  comingSoon = false,
}: DemoCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all duration-300 ${comingSoon ? "opacity-75" : "hover:shadow-lg"}`}
    >
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {image ? (
          <div
            className="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-300"
            style={{ backgroundImage: `url(${image})` }}
            role="img"
            aria-label={`${title} screenshot`}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <div className="text-white/80 text-6xl font-bold">
              {title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="mb-3 text-xl font-semibold">{title}</h3>
        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        <div className="flex gap-3">
          {comingSoon ? (
            <>
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed"
              >
                <ExternalLink className="h-4 w-4" />
                Open demo
              </button>
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-md border border-input bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed"
              >
                <Github className="h-4 w-4" />
                Source code
              </button>
            </>
          ) : (
            <>
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <ExternalLink className="h-4 w-4" />
                Open demo
              </a>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Github className="h-4 w-4" />
                Source code
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface DemoGridProps {
  children: React.ReactNode;
}

export function DemoGrid({ children }: DemoGridProps) {
  return <div className="grid gap-8 md:grid-cols-2">{children}</div>;
}

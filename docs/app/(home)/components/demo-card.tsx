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
      className={`group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all duration-300 ${comingSoon ? "opacity-75" : "hover:shadow-lg hover:scale-[1.02]"}`}
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-muted group-hover:shadow-2xl transition-shadow duration-300">
        {image ? (
          <div
            className="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundImage: `url(${image})` }}
            role="img"
            aria-label={`${title} screenshot`}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <div className="text-white/80 text-6xl font-bold">
              {title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-lg font-semibold">{title}</div>
        <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
        <div className="flex gap-2">
          {comingSoon ? (
            <>
              <button
                disabled
                className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground cursor-not-allowed"
              >
                <ExternalLink className="h-3 w-3" />
                Open demo
              </button>
              <button
                disabled
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground cursor-not-allowed"
              >
                <Github className="h-3 w-3" />
                Source code
              </button>
            </>
          ) : (
            <>
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 no-underline"
              >
                <ExternalLink className="h-3 w-3" />
                Open demo
              </a>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground no-underline"
              >
                <Github className="h-3 w-3" />
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

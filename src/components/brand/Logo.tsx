import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  markOnly?: boolean;
}

export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="size-8 shrink-0 text-accent"
        fill="none"
      >
        <path
          d="M23.85 5.5 8.25 36.75h9.2l10.9-21.85-4.5-9.4Z"
          fill="currentColor"
        />
        <path
          d="m30.45 18.75 9.3 18H20.7l4.3-8.5h5.15l-4.1-8 4.4-1.5Z"
          fill="currentColor"
          opacity=".88"
        />
      </svg>
      {!markOnly && (
        <span className="font-display text-lg font-bold tracking-[-0.055em] text-primary">
          Alenasck
        </span>
      )}
    </span>
  );
}

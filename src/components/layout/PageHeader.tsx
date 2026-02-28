import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "~/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  backTo,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex items-center gap-3 px-4 py-4", className)}>
      {backTo && (
        <Link
          to={backTo}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold leading-tight truncate">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import { Coffee, GlassWater, BookOpen, Settings, Home } from "lucide-react";
import { cn } from "~/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/espresso", label: "Espresso", icon: Coffee },
  { to: "/pour-over", label: "Pour Over", icon: GlassWater },
  { to: "/recipes", label: "Recipes", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={isActive ? 2.5 : 2}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

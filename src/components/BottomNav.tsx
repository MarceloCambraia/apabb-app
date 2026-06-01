import { Link, useLocation } from "react-router-dom";
import { Home, HandHeart, Heart, User, Newspaper } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/voluntariado", icon: HandHeart, label: "Voluntariado" },
  { to: "/doar", icon: Heart, label: "Doar" },
  { to: "/noticias", icon: Newspaper, label: "Notícias" },
  { to: "/perfil", icon: User, label: "Perfil" },
];

const guestNavItems = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/voluntariado", icon: HandHeart, label: "Voluntariado" },
  { to: "/doar", icon: Heart, label: "Doar" },
  { to: "/noticias", icon: Newspaper, label: "Notícias" },
  { to: "/auth", icon: User, label: "Entrar" },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const items = user ? navItems : guestNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around">
        {items.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon
                className={cn("w-5 h-5", isActive && "stroke-[2.5]")}
              />
              <span className="text-[10px] leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

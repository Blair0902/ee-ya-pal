import { NavLink, useLocation } from "react-router-dom";
import { MessageCircleHeart, BookOpen, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", label: "聊聊", icon: MessageCircleHeart },
  { to: "/story", label: "故事", icon: BookOpen },
  { to: "/pokedex", label: "图鉴", icon: Sparkles },
  { to: "/me", label: "我的", icon: User },
];

export const TabBar = ({ dark = false }: { dark?: boolean }) => {
  const { pathname } = useLocation();
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 px-3 pt-2 pb-safe backdrop-blur-md",
        dark ? "bg-[hsl(230_25%_14%)]/95 border-t border-white/5" : "bg-card/95 shadow-tab",
      )}
      style={{ borderTopLeftRadius: "2rem", borderTopRightRadius: "2rem" }}
      aria-label="主导航"
    >
      <ul className="flex items-end justify-around">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to === "/home" && pathname === "/");
          return (
            <li key={to} className="flex-1">
              <NavLink to={to} className="flex flex-col items-center gap-0.5 py-2 outline-none" aria-label={label}>
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300",
                    active
                      ? "bg-gradient-primary text-primary-foreground scale-110 shadow-pop"
                      : dark ? "text-white/55" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("transition-all", active ? "h-6 w-6" : "h-5 w-5")} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span
                  className={cn(
                    "font-display text-[11px] font-bold transition-colors",
                    active ? "text-primary" : dark ? "text-white/55" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

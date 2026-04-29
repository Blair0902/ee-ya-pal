import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircleHeart, Compass, Backpack } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "家", icon: Home, key: "home" },
  { to: "/chat", label: "聊聊", icon: MessageCircleHeart, key: "chat" },
  { to: "/quiz", label: "冒险", icon: Compass, key: "quiz" },
  { to: "/backpack", label: "小屋", icon: Backpack, key: "backpack" },
];

export const TabBar = () => {
  const { pathname } = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 bg-card/95 px-3 pt-2 shadow-tab backdrop-blur-md pb-safe"
      style={{ borderTopLeftRadius: "2rem", borderTopRightRadius: "2rem" }}
      aria-label="主导航"
    >
      <ul className="flex items-end justify-around">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className="flex flex-col items-center gap-0.5 py-2 outline-none"
                aria-label={label}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300",
                    active
                      ? "bg-gradient-primary text-primary-foreground scale-110 shadow-pop"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("transition-all", active ? "h-6 w-6" : "h-5 w-5")} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span
                  className={cn(
                    "font-display text-[11px] font-bold transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
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

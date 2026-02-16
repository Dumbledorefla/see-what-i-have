import { NavLink } from "react-router-dom";
import { LayoutDashboard, Zap, BarChart3, Bookmark, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/gerar", label: "Gerar", icon: Zap },
  { to: "/analise", label: "Análise", icon: BarChart3 },
  { to: "/minhas-apostas", label: "Apostas", icon: Bookmark },
  { to: "/backtest", label: "Backtest", icon: FlaskConical },
];

const BottomNav = () => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border">
    <div className="flex justify-around py-2">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <link.icon className="w-5 h-5" />
          {link.label}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default BottomNav;

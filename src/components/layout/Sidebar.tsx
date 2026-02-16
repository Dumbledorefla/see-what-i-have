import { NavLink } from "react-router-dom";
import { LayoutDashboard, Zap, BarChart3, Bookmark, FlaskConical, History, Settings, Clover } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/gerar", label: "Gerar Apostas", icon: Zap },
  { to: "/analise", label: "Análise", icon: BarChart3 },
  { to: "/minhas-apostas", label: "Minhas Apostas", icon: Bookmark },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/backtest", label: "Backtest", icon: FlaskConical },
  { to: "/config", label: "Configurações", icon: Settings },
];

const Sidebar = () => (
  <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-sidebar border-r border-sidebar-border z-50">
    <div className="p-6 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
        <Clover className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h1 className="font-mono font-bold text-base text-foreground tracking-tight">
          LOTOFÁCIL<span className="text-primary">.AI</span>
        </h1>
        <p className="text-[10px] text-muted-foreground font-mono">Motor de Cobertura V3</p>
      </div>
    </div>

    <nav className="flex-1 px-3 space-y-1">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/15 text-primary glow-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )
          }
        >
          <link.icon className="w-4 h-4" />
          {link.label}
        </NavLink>
      ))}
    </nav>

    <div className="p-4 mx-3 mb-4 rounded-lg border border-border bg-secondary/30">
      <p className="text-[10px] font-mono text-muted-foreground">
        Não é previsão, é otimização combinatória.
      </p>
    </div>
  </aside>
);

export default Sidebar;

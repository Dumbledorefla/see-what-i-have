import { Shield, Target, Flame, Wrench } from "lucide-react";
import type { Estrategia } from "@/lib/geradorApostas";

interface StrategySelectorProps {
  value: Estrategia;
  onChange: (s: Estrategia) => void;
}

const strategies: { id: Estrategia; label: string; desc: string; icon: typeof Shield }[] = [
  { id: "conservadora", label: "Conservadora", desc: "Top 18 mais frequentes", icon: Shield },
  { id: "balanceada", label: "Balanceada", desc: "Mix frequentes + intermediárias", icon: Target },
  { id: "agressiva", label: "Agressiva", desc: "Frequentes + atrasadas", icon: Flame },
  { id: "manual", label: "Manual", desc: "Escolha suas dezenas", icon: Wrench },
];

const StrategySelector = ({ value, onChange }: StrategySelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {strategies.map(s => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`stat-card text-left transition-all p-4 ${
            value === s.id
              ? "!border-primary glow-primary"
              : "hover:border-muted-foreground/30"
          }`}
        >
          <s.icon className={`w-5 h-5 mb-2 ${value === s.id ? "text-primary" : "text-muted-foreground"}`} />
          <p className={`font-mono font-bold text-sm ${value === s.id ? "text-primary" : "text-foreground"}`}>
            {s.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
        </button>
      ))}
    </div>
  );
};

export default StrategySelector;

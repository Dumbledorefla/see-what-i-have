import { DollarSign } from "lucide-react";

interface BudgetInputProps {
  value: number;
  onChange: (v: number) => void;
}

const BudgetInput = ({ value, onChange }: BudgetInputProps) => {
  const nApostas = Math.floor(value / 3.5);

  return (
    <div className="stat-card flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-1">
        <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">
            Orçamento (R$)
          </label>
          <input
            type="number"
            min={3}
            max={999}
            step={3}
            value={value}
            onChange={(e) => onChange(Math.max(3, parseInt(e.target.value) || 3))}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 font-mono text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-mono font-bold text-primary">{nApostas}</p>
        <p className="text-xs font-mono text-muted-foreground">apostas × R$3,50</p>
      </div>
    </div>
  );
};

export default BudgetInput;

import { motion } from "framer-motion";

interface AtrasoChartProps {
  atrasos: Record<string, number>;
}

const AtrasoChart = ({ atrasos }: AtrasoChartProps) => {
  const sorted = Object.entries(atrasos)
    .map(([num, atr]) => ({ numero: parseInt(num), atraso: atr }))
    .sort((a, b) => b.atraso - a.atraso)
    .slice(0, 10);

  const maxAtraso = sorted.length > 0 ? sorted[0].atraso : 1;

  return (
    <div className="stat-card">
      <h3 className="font-mono font-bold text-foreground text-lg mb-1">
        TOP 10 — MAIS ATRASADOS
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        Números que não saem há mais tempo
      </p>
      <div className="space-y-2">
        {sorted.map((item, i) => (
          <div key={item.numero} className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-destructive/20 text-destructive flex items-center justify-center text-xs font-mono font-bold">
              {String(item.numero).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.atraso / maxAtraso) * 100}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="h-full rounded-full bg-destructive/70"
                />
              </div>
            </div>
            <span className="text-xs font-mono text-muted-foreground w-24 text-right">
              {item.atraso} {item.atraso > 1 ? 'sorteios' : 'sorteio'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtrasoChart;

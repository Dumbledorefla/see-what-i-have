import { motion } from "framer-motion";
import type { BacktestResult } from "@/lib/lotofacilData";

interface BacktestTableProps {
  results: BacktestResult[];
}

const BacktestTable = ({ results }: BacktestTableProps) => {
  const sorted = [...results].sort((a, b) => b.roi_estimado_pct - a.roi_estimado_pct);

  return (
    <div className="stat-card">
      <h3 className="font-mono font-bold text-primary text-lg mb-1">
        BACKTEST — 300 SORTEIOS
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        Performance das apostas contra o histórico
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
              <th className="text-left py-2 px-2">ID</th>
              <th className="text-right py-2 px-2">11+</th>
              <th className="text-right py-2 px-2">12+</th>
              <th className="text-right py-2 px-2">13+</th>
              <th className="text-right py-2 px-2">14+</th>
              <th className="text-right py-2 px-2">ROI</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <motion.tr
                key={r.aposta_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border/50"
              >
                <td className="py-2 px-2 text-primary font-bold">#{r.aposta_id}</td>
                <td className="py-2 px-2 text-right text-muted-foreground">{r.acertos_11}</td>
                <td className="py-2 px-2 text-right text-muted-foreground">{r.acertos_12}</td>
                <td className="py-2 px-2 text-right">
                  <span className={r.acertos_13 > 0 ? "text-accent font-bold" : "text-muted-foreground"}>
                    {r.acertos_13}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  <span className={r.acertos_14 > 0 ? "text-accent font-bold" : "text-muted-foreground"}>
                    {r.acertos_14}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  <span
                    className={`font-bold ${
                      r.roi_estimado_pct > 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {r.roi_estimado_pct > 0 ? "+" : ""}
                    {r.roi_estimado_pct.toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BacktestTable;

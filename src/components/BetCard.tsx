import { motion } from "framer-motion";
import NumberGrid from "./NumberGrid";
import type { ApostaIntelligente } from "@/lib/geradorApostas";

interface BetCardProps {
  aposta: ApostaIntelligente;
  index: number;
}

const BetCard = ({ aposta, index }: BetCardProps) => {
  const faixaLabels = ["1-5", "6-10", "11-15", "16-20", "21-25"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="stat-card glow-primary"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono font-bold text-primary text-lg">
          APOSTA #{index + 1}
        </h3>
        <span className="text-xs font-mono px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          Score: {aposta.humanidade_score}
        </span>
      </div>

      <div className="mb-4">
        <NumberGrid activeNumbers={aposta.dezenas} size="sm" />
      </div>

      <div className="space-y-2 text-sm font-mono">
        <div className="flex justify-between text-muted-foreground">
          <span>Pares/Ímpares</span>
          <span className="text-foreground">{aposta.pares}/{15 - aposta.pares}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Soma</span>
          <span className="text-foreground">{aposta.soma}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Faixas</span>
          <span className="text-foreground">{aposta.faixas.join("-")}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex flex-wrap gap-1.5">
          {aposta.dezenas.map(d => (
            <span
              key={d}
              className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/15 text-primary"
            >
              {String(d).padStart(2, "0")}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BetCard;

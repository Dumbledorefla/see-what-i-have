import { motion } from "framer-motion";
import { PieChart, CheckCircle2 } from "lucide-react";
import type { ConjuntoOtimizado } from "@/lib/geradorApostas";
import NumberGrid from "./NumberGrid";

interface CoverageDisplayProps {
  conjunto: ConjuntoOtimizado;
}

const CoverageDisplay = ({ conjunto }: CoverageDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card glow-primary"
    >
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-primary" />
        <h3 className="font-mono font-bold text-primary text-lg">RESULTADO DA COBERTURA</h3>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-3xl font-mono font-bold text-primary">
            {conjunto.cobertura_final_pct.toFixed(1)}%
          </p>
          <p className="text-xs font-mono text-muted-foreground">Cobertura de trios</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-mono font-bold text-foreground">
            {conjunto.apostas.length}
          </p>
          <p className="text-xs font-mono text-muted-foreground">Apostas geradas</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-mono font-bold text-accent">
            R${conjunto.custo_total}
          </p>
          <p className="text-xs font-mono text-muted-foreground">Custo total</p>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <p className="text-xs font-mono text-muted-foreground">
            Universo utilizado ({conjunto.universo.length} dezenas):
          </p>
        </div>
        <NumberGrid activeNumbers={conjunto.universo} size="sm" />
      </div>
    </motion.div>
  );
};

export default CoverageDisplay;

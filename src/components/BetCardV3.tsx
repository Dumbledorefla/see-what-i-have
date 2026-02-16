import { motion } from "framer-motion";
import { Copy, Check, Award } from "lucide-react";
import { useState } from "react";
import NumberGrid from "./NumberGrid";
import type { ApostaV2 } from "@/lib/geradorApostas";

interface BetCardV3Props {
  aposta: ApostaV2;
  dezenasSorteadas?: number[];
}

const BetCardV3 = ({ aposta, dezenasSorteadas = [] }: BetCardV3Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = aposta.dezenas.map(d => String(d).padStart(2, "0")).join(", ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const acertos = dezenasSorteadas.length > 0
    ? aposta.dezenas.filter(d => dezenasSorteadas.includes(d)).length
    : 0;

  const isPremiada = acertos >= 11;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: aposta.id * 0.03 }}
      className={`glass-card p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${isPremiada ? 'glow-accent' : 'glass-card-hover'}`}
    >
      {isPremiada && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
          <Award className="w-3 h-3" /> {acertos} acertos
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-mono font-bold text-primary text-sm">
          APOSTA #{String(aposta.id).padStart(2, "0")}
        </h4>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 ${isPremiada ? 'mr-16' : ''}`}>
            H:{aposta.humanidade_score}
          </span>
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:text-primary transition-colors p-1"
            title="Copiar dezenas"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="mb-3">
        <NumberGrid activeNumbers={aposta.dezenas} highlightedNumbers={dezenasSorteadas} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="text-center">
          <p className="text-muted-foreground">P/I</p>
          <p className="text-foreground font-bold">{aposta.pares}/{15 - aposta.pares}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Soma</p>
          <p className="text-foreground font-bold">{aposta.soma}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Trios</p>
          <p className="text-accent font-bold">+{aposta.novos_trios_cobertos}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default BetCardV3;

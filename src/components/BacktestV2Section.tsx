import { motion } from "framer-motion";
import { FlaskConical, TrendingUp, TrendingDown } from "lucide-react";
import type { BacktestV2Result } from "@/lib/lotofacilData";

interface BacktestV2SectionProps {
  data: BacktestV2Result;
}

const BacktestV2Section = ({ data }: BacktestV2SectionProps) => {
  const { estrategia_otimizada: eo, baseline_medio: bl, alpha } = data;

  return (
    <div className="space-y-6">
      {/* Alpha highlight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card glow-primary text-center py-6"
      >
        <h3 className="font-mono font-bold text-primary text-xl mb-2">
          A ESTRATÉGIA FUNCIONA?
        </h3>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto mb-6">
          Testamos nossa estratégia de cobertura contra os últimos 1000 sorteios da Lotofácil.
          O resultado? Nosso método teve um ROI{" "}
          <span className="text-primary font-bold">{alpha.roi.toFixed(2)} pontos percentuais maior</span>{" "}
          do que 33 apostas feitas de forma puramente aleatória, gerando{" "}
          <span className="text-accent font-bold">54% mais prêmios na faixa de 13 acertos</span>.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-mono font-bold text-primary">+{alpha.roi.toFixed(2)}</p>
            <p className="text-xs font-mono text-muted-foreground">p.p. ROI (Alpha)</p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-accent">+R${alpha.retorno.toFixed(0)}</p>
            <p className="text-xs font-mono text-muted-foreground">Retorno extra</p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-primary">+{alpha.acertos_13.toFixed(0)}</p>
            <p className="text-xs font-mono text-muted-foreground">Acertos 13+ a mais</p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-foreground">1000</p>
            <p className="text-xs font-mono text-muted-foreground">Concursos testados</p>
          </div>
        </div>
      </motion.div>

      {/* Comparison table */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="font-mono font-bold text-primary">ESTRATÉGIA OTIMIZADA</h4>
          </div>
          <div className="space-y-3 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROI</span>
              <span className="text-destructive font-bold">{eo.roi.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retorno total</span>
              <span className="text-foreground">R${eo.retorno_total.toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Custo total</span>
              <span className="text-foreground">R${eo.custo_total.toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acertos 13+</span>
              <span className="text-accent font-bold">{eo.acertos["13"]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acertos 11+</span>
              <span className="text-foreground">{eo.acertos["11"]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concursos c/ prêmio</span>
              <span className="text-foreground">{eo.concursos_com_premio_pct}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-muted-foreground" />
            <h4 className="font-mono font-bold text-muted-foreground">BASELINE ALEATÓRIO</h4>
          </div>
          <div className="space-y-3 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROI</span>
              <span className="text-destructive font-bold">{bl.roi.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retorno total</span>
              <span className="text-foreground">R${bl.retorno_total.toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acertos 13+</span>
              <span className="text-foreground">{bl.acertos_13}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acertos 14+</span>
              <span className="text-foreground">{bl.acertos_14}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concursos c/ prêmio</span>
              <span className="text-foreground">{bl.concursos_com_premio_pct}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <FlaskConical className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-mono font-bold text-primary mb-1">Sobre o Backtest V2</p>
          <p className="text-muted-foreground">
            33 apostas otimizadas foram testadas contra 1000 sorteios históricos com prêmios reais.
            O alpha de +{alpha.roi.toFixed(2)} p.p. mostra que o motor de cobertura supera apostas
            aleatórias. ROI negativo é esperado — o objetivo é maximizar o valor esperado dentro
            do orçamento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BacktestV2Section;

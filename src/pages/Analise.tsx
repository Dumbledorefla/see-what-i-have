import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { calcularFrequencias, calcularDistribuicaoParidade, calcularDistribuicaoSoma } from "@/lib/lotofacilData";
import FrequencyChart from "@/components/FrequencyChart";
import ParityChart from "@/components/ParityChart";
import SomaChart from "@/components/SomaChart";
import AtrasoChart from "@/components/AtrasoChart";

const Analise = () => {
  const { sorteios, analise } = useData();

  const frequencias = calcularFrequencias(sorteios);
  const paridade = calcularDistribuicaoParidade(sorteios);
  const distribuicaoSoma = calcularDistribuicaoSoma(sorteios);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <BarChart3 className="w-6 h-6 inline-block mr-2 text-primary" />
          Análise Estatística
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Dados de {sorteios.length} concursos da Lotofácil
        </p>
      </div>

      <FrequencyChart frequencias={frequencias} />

      <div className="grid md:grid-cols-2 gap-6">
        <ParityChart data={paridade} />
        {distribuicaoSoma && <SomaChart data={distribuicaoSoma.distribuicao} media={distribuicaoSoma.media} />}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-mono font-bold text-primary text-lg mb-1">TOP 10 — MAIS FREQUENTES</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Números com maior aparição em {sorteios.length} concursos
          </p>
          <div className="space-y-2">
            {[...frequencias]
              .sort((a, b) => b.frequencia - a.frequencia)
              .slice(0, 10)
              .map((f, i) => (
                <div key={f.numero} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full number-ball-active flex items-center justify-center text-xs font-mono font-bold">
                    {String(f.numero).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.percentual}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-20 text-right">
                    {f.frequencia}x ({f.percentual}%)
                  </span>
                </div>
              ))}
          </div>
        </div>
        {analise && <AtrasoChart atrasos={analise.atrasos_atuais} />}
      </div>
    </motion.div>
  );
};

export default Analise;

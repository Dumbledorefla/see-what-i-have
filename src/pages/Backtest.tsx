import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import BacktestV2Section from "@/components/BacktestV2Section";
import { useState } from "react";
import type { Filtros } from "@/lib/lotofacilData";

const Backtest = () => {
  const { sorteios, backtestV2 } = useData();
  const [filtros] = useState<Filtros>({
    pares_min: 5, pares_max: 10, soma_min: 160, soma_max: 230,
    repetidos_min: 6, repetidos_max: 11, humanidade_max: 80,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <FlaskConical className="w-6 h-6 inline-block mr-2 text-primary" />
          Backtest
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Teste suas estratégias contra o histórico real
        </p>
      </div>

      {backtestV2 ? (
        <BacktestV2Section data={backtestV2} sorteios={sorteios} filtros={filtros} />
      ) : (
        <p className="text-muted-foreground text-center font-mono">Carregando dados de backtest...</p>
      )}
    </motion.div>
  );
};

export default Backtest;

import { motion } from "framer-motion";
import { History } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import HistoryTable from "@/components/HistoryTable";

const Historico = () => {
  const { sorteios } = useData();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <History className="w-6 h-6 inline-block mr-2 text-primary" />
          Histórico de Sorteios
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Todos os {sorteios.length} concursos da Lotofácil
        </p>
      </div>

      <HistoryTable sorteios={sorteios} />
    </motion.div>
  );
};

export default Historico;

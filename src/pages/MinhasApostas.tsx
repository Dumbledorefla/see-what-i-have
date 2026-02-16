import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useLocalStorage } from "@/lib/hooks";
import HistoricoApostas, { type HistoricoConjunto } from "@/components/HistoricoApostas";
import { useEffect } from "react";
import { toast } from "sonner";

const PREMIOS: Record<number, number> = { 11: 6, 12: 12, 13: 30, 14: 1500, 15: 1500000 };

const MinhasApostas = () => {
  const { sorteios } = useData();
  const [historicoApostas, setHistoricoApostas] = useLocalStorage<HistoricoConjunto[]>('lotofacil-historico', []);

  // Auto-check on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('lotofacil-historico') || '[]') as HistoricoConjunto[];
    const aguardando = saved.filter(h => h.status === 'aguardando');
    if (aguardando.length === 0 || sorteios.length === 0) return;

    let atualizacoes = 0;
    const novoHistorico = saved.map(item => {
      if (item.status !== 'aguardando') return item;
      const sorteioRealizado = sorteios.find(s => s.concurso === item.concurso_alvo);
      if (!sorteioRealizado) return item;

      atualizacoes++;
      const resultado = { acertos: { '11': 0, '12': 0, '13': 0, '14': 0, '15': 0 }, retorno_total: 0 };
      item.conjunto.apostas.forEach(aposta => {
        const acertos = aposta.dezenas.filter(d => sorteioRealizado.dezenas.includes(d)).length;
        if (acertos >= 11) {
          resultado.acertos[String(acertos)]++;
          resultado.retorno_total += PREMIOS[acertos] || 0;
        }
      });
      return { ...item, status: 'conferido' as const, resultado };
    });

    if (atualizacoes > 0) {
      localStorage.setItem('lotofacil-historico', JSON.stringify(novoHistorico));
      setHistoricoApostas(novoHistorico);
      toast.info(`${atualizacoes} conjunto(s) conferidos automaticamente!`);
    }
  }, [sorteios]);

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja apagar este conjunto?')) {
      setHistoricoApostas(historicoApostas.filter(item => item.id !== id));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <Bookmark className="w-6 h-6 inline-block mr-2 text-primary" />
          Minhas Apostas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Apostas salvas e conferência automática de resultados
        </p>
      </div>

      <HistoricoApostas historico={historicoApostas} sorteios={sorteios} onDelete={handleDelete} />
    </motion.div>
  );
};

export default MinhasApostas;

import { motion } from "framer-motion";
import { LayoutDashboard, Hash, TrendingUp, Clock, Zap, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import GlassCard from "@/components/GlassCard";
import NumberGrid from "@/components/NumberGrid";
import { calcularFrequencias } from "@/lib/lotofacilData";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const { sorteios, analise } = useData();
  const navigate = useNavigate();

  const ultimoSorteio = sorteios[sorteios.length - 1];
  const frequencias = calcularFrequencias(sorteios);
  const maisFrequente = [...frequencias].sort((a, b) => b.frequencia - a.frequencia)[0];

  const atrasos = analise?.atrasos_atuais || {};
  const maisAtrasado = Object.entries(atrasos).sort(([, a], [, b]) => b - a)[0];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Page header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">
          <LayoutDashboard className="w-6 h-6 inline-block mr-2 text-muted-foreground" />
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumo dos {sorteios.length} concursos analisados
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground uppercase">Próximo Concurso</span>
            </div>
            <p className="text-3xl font-mono font-bold text-foreground">
              #{ultimoSorteio.concurso + 1}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Baseado no último resultado</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground uppercase">Último Resultado</span>
            </div>
            <p className="text-3xl font-mono font-bold text-foreground">
              #{ultimoSorteio.concurso}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{ultimoSorteio.data}</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-muted-foreground uppercase">Mais Frequente</span>
            </div>
            <p className="text-3xl font-mono font-bold text-accent">
              {String(maisFrequente.numero).padStart(2, "0")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{maisFrequente.frequencia}x em {sorteios.length} concursos</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-destructive" />
              <span className="text-xs font-mono text-muted-foreground uppercase">Mais Atrasado</span>
            </div>
            <p className="text-3xl font-mono font-bold text-destructive">
              {maisAtrasado ? String(maisAtrasado[0]).padStart(2, "0") : "--"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {maisAtrasado ? `${maisAtrasado[1]} sorteios sem sair` : "—"}
            </p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Last draw grid */}
      <motion.div variants={item}>
        <GlassCard>
          <h3 className="font-mono font-bold text-foreground mb-3 text-sm">ÚLTIMO SORTEIO — #{ultimoSorteio.concurso}</h3>
          <NumberGrid activeNumbers={ultimoSorteio.dezenas} />
        </GlassCard>
      </motion.div>

      {/* Quick action */}
      <motion.div variants={item}>
        <button
          onClick={() => navigate("/gerar")}
          className="w-full glass-card glass-card-hover p-6 text-left group transition-transform hover:scale-[1.02] duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Gerar Apostas Otimizadas</h3>
              <p className="text-sm text-muted-foreground">Motor de cobertura combinatória com fechamento guloso</p>
            </div>
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;

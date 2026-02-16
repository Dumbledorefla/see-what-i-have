import { motion } from "framer-motion";
import { TrendingUp, Hash, Scale, Repeat } from "lucide-react";
import type { Sorteio } from "@/lib/lotofacilData";

interface StatsOverviewProps {
  sorteios: Sorteio[];
}

const StatsOverview = ({ sorteios }: StatsOverviewProps) => {
  if (sorteios.length === 0) return null;

  const somas = sorteios.map(s => s.dezenas.reduce((a, b) => a + b, 0));
  const mediaSoma = (somas.reduce((a, b) => a + b, 0) / somas.length).toFixed(1);
  
  const paresMedia = (
    sorteios.reduce((acc, s) => acc + s.dezenas.filter(d => d % 2 === 0).length, 0) / sorteios.length
  ).toFixed(1);

  let totalRepetitions = 0;
  for (let i = 1; i < sorteios.length; i++) {
    const prevSet = new Set(sorteios[i - 1].dezenas);
    totalRepetitions += sorteios[i].dezenas.filter(d => prevSet.has(d)).length;
  }
  const mediaRepeticoes = (totalRepetitions / (sorteios.length - 1)).toFixed(1);

  const stats = [
    {
      icon: Hash,
      label: "Concursos",
      value: sorteios.length.toString(),
      sub: `${sorteios[0].concurso} — ${sorteios[sorteios.length - 1].concurso}`,
    },
    {
      icon: TrendingUp,
      label: "Soma Média",
      value: mediaSoma,
      sub: "Intervalo ideal: 177-213",
    },
    {
      icon: Scale,
      label: "Pares (média)",
      value: paresMedia,
      sub: `Ímpares: ${(15 - parseFloat(paresMedia)).toFixed(1)}`,
    },
    {
      icon: Repeat,
      label: "Repetições",
      value: mediaRepeticoes,
      sub: "Do concurso anterior",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;

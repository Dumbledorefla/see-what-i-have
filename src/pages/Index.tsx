import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, BarChart3, History, FlaskConical, AlertTriangle, Clover } from "lucide-react";
import { parseCsvData, calcularFrequencias, calcularDistribuicaoParidade, type Sorteio, type BacktestResult } from "@/lib/lotofacilData";
import { gerarApostasInteligentes, type ApostaIntelligente } from "@/lib/geradorApostas";
import StatsOverview from "@/components/StatsOverview";
import FrequencyChart from "@/components/FrequencyChart";
import ParityChart from "@/components/ParityChart";
import BetCard from "@/components/BetCard";
import HistoryTable from "@/components/HistoryTable";
import BacktestTable from "@/components/BacktestTable";
import NumberGrid from "@/components/NumberGrid";

type Tab = "gerar" | "analise" | "historico" | "backtest";

const Index = () => {
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [backtestData, setBacktestData] = useState<BacktestResult[]>([]);
  const [apostas, setApostas] = useState<ApostaIntelligente[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("gerar");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/lotofacil_data.csv").then(r => r.text()),
      fetch("/data/lotofacil_simulacao.json").then(r => r.json()),
    ]).then(([csvText, simData]) => {
      const parsed = parseCsvData(csvText);
      setSorteios(parsed);
      setBacktestData(simData.backtest || []);
      setLoading(false);
    });
  }, []);

  const handleGerar = useCallback(() => {
    if (sorteios.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      const ultimo = sorteios[sorteios.length - 1];
      const novas = gerarApostasInteligentes(ultimo.dezenas, 3);
      setApostas(novas);
      setIsGenerating(false);
    }, 800);
  }, [sorteios]);

  const frequencias = sorteios.length > 0 ? calcularFrequencias(sorteios) : [];
  const paridade = sorteios.length > 0 ? calcularDistribuicaoParidade(sorteios) : [];
  const ultimoSorteio = sorteios.length > 0 ? sorteios[sorteios.length - 1] : null;

  const tabs: { id: Tab; label: string; icon: typeof Zap }[] = [
    { id: "gerar", label: "Gerar Apostas", icon: Zap },
    { id: "analise", label: "Análise", icon: BarChart3 },
    { id: "historico", label: "Histórico", icon: History },
    { id: "backtest", label: "Backtest", icon: FlaskConical },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clover className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse-glow" />
          <p className="font-mono text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clover className="w-7 h-7 text-primary" />
            <div>
              <h1 className="font-mono font-bold text-lg text-foreground tracking-tight">
                LOTOFÁCIL<span className="text-primary">.AI</span>
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Engenharia Combinatória Inteligente
              </p>
            </div>
          </div>
          {ultimoSorteio && (
            <div className="hidden sm:block text-right">
              <p className="text-xs text-muted-foreground font-mono">Último concurso</p>
              <p className="font-mono font-bold text-primary">
                #{ultimoSorteio.concurso} — {ultimoSorteio.data}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-border bg-card/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-mono transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Stats always visible */}
        <div className="mb-8">
          <StatsOverview sorteios={sorteios} />
        </div>

        {/* Tab Content */}
        {activeTab === "gerar" && (
          <motion.div
            key="gerar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Hero section */}
            <div className="stat-card text-center py-8">
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-foreground mb-2">
                Gere Apostas <span className="text-primary text-glow-primary">Inteligentes</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6 text-sm">
                Motor de geração com filtros de paridade, soma, faixas e anti-padrões humanos.
                Baseado na análise de {sorteios.length} concursos.
              </p>

              <button
                onClick={handleGerar}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-mono font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 glow-primary-strong"
              >
                <Zap className="w-4 h-4" />
                {isGenerating ? "Gerando..." : "Gerar 3 Apostas"}
              </button>

              {ultimoSorteio && (
                <div className="mt-6 flex justify-center">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-2">
                      Referência: Concurso #{ultimoSorteio.concurso}
                    </p>
                    <NumberGrid activeNumbers={ultimoSorteio.dezenas} size="sm" />
                  </div>
                </div>
              )}
            </div>

            {/* Generated bets */}
            {apostas.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4">
                {apostas.map((aposta, i) => (
                  <BetCard key={i} aposta={aposta} index={i} />
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
              <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-mono font-bold text-accent mb-1">Aviso Legal</p>
                <p className="text-muted-foreground">
                  Esta plataforma não prevê números da Lotofácil. Ela otimiza apostas com base em
                  análise estatística e engenharia combinatória. A Lotofácil é um jogo de azar e
                  não há garantia de ganho.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "analise" && (
          <motion.div
            key="analise"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <FrequencyChart frequencias={frequencias} />
            <div className="grid md:grid-cols-2 gap-6">
              <ParityChart data={paridade} />
              <div className="stat-card">
                <h3 className="font-mono font-bold text-primary text-lg mb-1">
                  TOP 10 — MAIS FREQUENTES
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Números com maior aparição
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
                        <span className="text-xs font-mono text-muted-foreground w-16 text-right">
                          {f.frequencia}x ({f.percentual}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "historico" && (
          <motion.div
            key="historico"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <HistoryTable sorteios={sorteios} />
          </motion.div>
        )}

        {activeTab === "backtest" && (
          <motion.div
            key="backtest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <BacktestTable results={backtestData} />
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <FlaskConical className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-mono font-bold text-primary mb-1">Sobre o Backtest</p>
                <p className="text-muted-foreground">
                  As 10 apostas foram testadas contra 300 sorteios históricos. ROI calculado com
                  prêmios estimados (R$6 para 11 acertos, R$12 para 12, R$30 para 13, R$1.500
                  para 14). ROI negativo é esperado — o objetivo é maximizar o valor esperado.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            LOTOFÁCIL.AI — Engenharia Combinatória • Análise de {sorteios.length} concursos •
            Não é previsão, é otimização
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

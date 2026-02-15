import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, BarChart3, History, FlaskConical, AlertTriangle, Clover, Loader2 } from "lucide-react";
import { parseCsvCompleto, calcularFrequencias, calcularDistribuicaoParidade, type Sorteio, type AnaliseCompleta, type BacktestV2Result } from "@/lib/lotofacilData";
import { gerarConjuntoOtimizado, type Estrategia, type ConjuntoOtimizado } from "@/lib/geradorApostas";
import StatsOverview from "@/components/StatsOverview";
import FrequencyChart from "@/components/FrequencyChart";
import ParityChart from "@/components/ParityChart";
import HistoryTable from "@/components/HistoryTable";
import NumberGrid from "@/components/NumberGrid";
import StrategySelector from "@/components/StrategySelector";
import BudgetInput from "@/components/BudgetInput";
import CoverageDisplay from "@/components/CoverageDisplay";
import BetCardV2 from "@/components/BetCardV2";
import BacktestV2Section from "@/components/BacktestV2Section";
import ManualUniverseSelector from "@/components/ManualUniverseSelector";

type Tab = "gerar" | "analise" | "historico" | "backtest";

const Index = () => {
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [analise, setAnalise] = useState<AnaliseCompleta | null>(null);
  const [backtestV2, setBacktestV2] = useState<BacktestV2Result | null>(null);
  const [conjunto, setConjunto] = useState<ConjuntoOtimizado | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("gerar");
  const [estrategia, setEstrategia] = useState<Estrategia>("balanceada");
  const [orcamento, setOrcamento] = useState(99);
  const [manualUniverse, setManualUniverse] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/lotofacil_completo.csv").then(r => r.text()),
      fetch("/data/analise_completa.json").then(r => r.json()),
      fetch("/data/backtest_resultados.json").then(r => r.json()),
    ]).then(([csvText, analiseData, btData]) => {
      const parsed = parseCsvCompleto(csvText);
      setSorteios(parsed);
      setAnalise(analiseData);
      setBacktestV2(btData);
      setLoading(false);
    });
  }, []);

  const nApostas = Math.floor(orcamento / 3);

  const handleGerar = useCallback(() => {
    if (sorteios.length === 0 || !analise) return;
    if (estrategia === "manual" && manualUniverse.length < 18) return;

    setIsGenerating(true);
    setProgress(0);
    setConjunto(null);

    // Run in setTimeout to not block UI
    setTimeout(() => {
      const ultimo = sorteios[sorteios.length - 1];
      const result = gerarConjuntoOtimizado(
        estrategia,
        nApostas,
        analise,
        ultimo.dezenas,
        estrategia === "manual" ? manualUniverse : undefined,
        (i, total) => setProgress(Math.round((i / total) * 100))
      );
      setConjunto(result);
      setIsGenerating(false);
    }, 50);
  }, [sorteios, analise, estrategia, nApostas, manualUniverse]);

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
          <Clover className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="font-mono text-muted-foreground">Carregando 3614 concursos...</p>
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
                <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">V2</span>
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Motor de Cobertura Combinatória
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
        <div className="mb-8">
          <StatsOverview sorteios={sorteios} />
        </div>

        {/* Tab: Gerar */}
        {activeTab === "gerar" && (
          <motion.div key="gerar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="stat-card text-center py-6">
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-foreground mb-2">
                Motor de <span className="text-primary text-glow-primary">Cobertura V2</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-2 text-sm">
                Algoritmo de fechamento guloso que gera apostas coordenadas, maximizando a
                cobertura de trios dentro do seu universo de dezenas.
                Baseado em {sorteios.length} concursos.
              </p>
            </div>

            <StrategySelector value={estrategia} onChange={setEstrategia} />

            {estrategia === "manual" && (
              <ManualUniverseSelector selected={manualUniverse} onChange={setManualUniverse} />
            )}

            <BudgetInput value={orcamento} onChange={setOrcamento} />

            <div className="text-center">
              <button
                onClick={handleGerar}
                disabled={isGenerating || (estrategia === "manual" && manualUniverse.length < 18)}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-mono font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 glow-primary-strong"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando... {progress}%
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Gerar {nApostas} Apostas Otimizadas
                  </>
                )}
              </button>
            </div>

            {conjunto && (
              <>
                <CoverageDisplay conjunto={conjunto} />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conjunto.apostas.map(aposta => (
                    <BetCardV2 key={aposta.id} aposta={aposta} />
                  ))}
                </div>
              </>
            )}

            <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
              <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-mono font-bold text-accent mb-1">Aviso Legal</p>
                <p className="text-muted-foreground">
                  Esta plataforma não prevê números da Lotofácil. Ela otimiza apostas com base em
                  engenharia combinatória e fechamento de trios. A Lotofácil é um jogo de azar e
                  não há garantia de ganho.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab: Análise */}
        {activeTab === "analise" && (
          <motion.div key="analise" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <FrequencyChart frequencias={frequencias} />
            <div className="grid md:grid-cols-2 gap-6">
              <ParityChart data={paridade} />
              <div className="stat-card">
                <h3 className="font-mono font-bold text-primary text-lg mb-1">
                  TOP 10 — MAIS FREQUENTES
                </h3>
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
            </div>
          </motion.div>
        )}

        {/* Tab: Histórico */}
        {activeTab === "historico" && (
          <motion.div key="historico" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <HistoryTable sorteios={sorteios} />
          </motion.div>
        )}

        {/* Tab: Backtest */}
        {activeTab === "backtest" && (
          <motion.div key="backtest" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {backtestV2 ? (
              <BacktestV2Section data={backtestV2} />
            ) : (
              <p className="text-muted-foreground text-center font-mono">Carregando dados de backtest...</p>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            LOTOFÁCIL.AI V2 — Motor de Cobertura Combinatória • {sorteios.length} concursos •
            Não é previsão, é otimização
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

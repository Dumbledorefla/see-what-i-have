import { useState, useEffect, useCallback, lazy, Suspense, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, BarChart3, History, FlaskConical, AlertTriangle, Clover, Loader2, Settings, Bookmark } from "lucide-react";
import { Toaster, toast } from "sonner";
import { parseCsvCompleto, calcularFrequencias, calcularDistribuicaoParidade, calcularDistribuicaoSoma, type Sorteio, type AnaliseCompleta, type BacktestV2Result, type Filtros } from "@/lib/lotofacilData";
import type { Estrategia, ConjuntoOtimizado } from "@/lib/geradorApostas";
import type { WorkerInput, WorkerOutput } from "@/lib/generation.worker";
import { useLocalStorage } from "@/lib/hooks";
import StatsOverview from "@/components/StatsOverview";
import FrequencyChart from "@/components/FrequencyChart";
import ParityChart from "@/components/ParityChart";
import SomaChart from "@/components/SomaChart";
import AtrasoChart from "@/components/AtrasoChart";
import HistoryTable from "@/components/HistoryTable";
import StrategySelector from "@/components/StrategySelector";
import BudgetInput from "@/components/BudgetInput";
import CoverageDisplay from "@/components/CoverageDisplay";
import BetCardV2 from "@/components/BetCardV2";
import BacktestV2Section from "@/components/BacktestV2Section";
import ManualUniverseSelector from "@/components/ManualUniverseSelector";
import HistoricoApostas, { type HistoricoConjunto } from "@/components/HistoricoApostas";
const ExportButtons = lazy(() => import("@/components/ExportButtons"));
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

const PREMIOS: Record<number, number> = { 11: 6, 12: 12, 13: 30, 14: 1500, 15: 1500000 };

type Tab = "gerar" | "analise" | "historico" | "backtest" | "minhas_apostas";

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
  const [filtros, setFiltros] = useState<Filtros>({
    pares_min: 5, pares_max: 10, soma_min: 160, soma_max: 230,
    repetidos_min: 6, repetidos_max: 11, humanidade_max: 80,
  });

  const [historicoApostas, setHistoricoApostas] = useLocalStorage<HistoricoConjunto[]>('lotofacil-historico', []);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("../lib/generation.worker.ts", import.meta.url), { type: "module" });

    workerRef.current.onmessage = (e: MessageEvent<WorkerOutput>) => {
      const { type, payload } = e.data;
      if (type === "progress") {
        setProgress(payload);
      } else if (type === "result") {
        setConjunto(payload);
        setIsGenerating(false);
        toast.success(`${payload.apostas.length} apostas geradas com ${payload.cobertura_final_pct.toFixed(1)}% de cobertura!`);
      }
    };

    const conferirApostas = (sorteiosConferencia: Sorteio[]) => {
      const saved = JSON.parse(localStorage.getItem('lotofacil-historico') || '[]') as HistoricoConjunto[];
      const aguardando = saved.filter(h => h.status === 'aguardando');
      if (aguardando.length === 0) return;

      let atualizacoes = 0;
      const novoHistorico = saved.map(item => {
        if (item.status !== 'aguardando') return item;
        const sorteioRealizado = sorteiosConferencia.find(s => s.concurso === item.concurso_alvo);
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
        toast.info(`${atualizacoes} conjunto(s) de apostas foram conferidos!`);
      }
    };

    // Carregamento simplificado — apenas dados locais
    Promise.all([
      fetch("/data/lotofacil_completo.csv").then(r => r.text()),
      fetch("/data/analise_completa.json").then(r => r.json()),
      fetch("/data/backtest_resultados.json").then(r => r.json()),
    ]).then(([csvText, analiseData, backtestData]) => {
      const parsed = parseCsvCompleto(csvText);
      setSorteios(parsed);
      setAnalise(analiseData);
      setBacktestV2(backtestData);
      conferirApostas(parsed);
    }).catch(error => {
      console.error("Erro ao carregar dados locais:", error);
      toast.error("Falha ao carregar os dados da aplicação.");
    }).finally(() => setLoading(false));

    return () => { workerRef.current?.terminate(); };
  }, []);

  const nApostas = Math.floor(orcamento / 3.5);

  const handleGerar = useCallback(() => {
    if (!workerRef.current || sorteios.length === 0 || !analise) return;
    if (estrategia === "manual" && manualUniverse.length < 18) {
      toast.error("Selecione pelo menos 18 dezenas para o universo manual.");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setConjunto(null);

    const workerInput: WorkerInput = {
      estrategia, nApostas, analise,
      dezenasUltimoSorteio: sorteios[sorteios.length - 1].dezenas,
      manualUniverse: estrategia === "manual" ? manualUniverse : undefined,
      filtros,
    };
    workerRef.current.postMessage(workerInput);
  }, [sorteios, analise, estrategia, nApostas, manualUniverse, filtros]);

  const handleSaveApostas = () => {
    if (!conjunto || !ultimoSorteio) return;
    const novoItem: HistoricoConjunto = {
      id: Date.now(),
      concurso_alvo: ultimoSorteio.concurso + 1,
      data_salvo: new Date().toLocaleDateString('pt-BR'),
      conjunto,
      status: 'aguardando',
    };
    setHistoricoApostas([...historicoApostas, novoItem]);
    toast.success(`Apostas para o concurso #${novoItem.concurso_alvo} salvas para conferência!`);
  };

  const handleDeleteAposta = (id: number) => {
    if (window.confirm('Tem certeza que deseja apagar este conjunto de apostas?')) {
      setHistoricoApostas(historicoApostas.filter(item => item.id !== id));
    }
  };

  const frequencias = sorteios.length > 0 ? calcularFrequencias(sorteios) : [];
  const paridade = sorteios.length > 0 ? calcularDistribuicaoParidade(sorteios) : [];
  const distribuicaoSoma = sorteios.length > 0 ? calcularDistribuicaoSoma(sorteios) : null;
  const ultimoSorteio = sorteios.length > 0 ? sorteios[sorteios.length - 1] : null;

  const tabs: { id: Tab; label: string; icon: typeof Zap }[] = [
    { id: "gerar", label: "Gerar Apostas", icon: Zap },
    { id: "minhas_apostas", label: "Minhas Apostas", icon: Bookmark },
    { id: "analise", label: "Análise", icon: BarChart3 },
    { id: "historico", label: "Histórico", icon: History },
    { id: "backtest", label: "Backtest", icon: FlaskConical },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clover className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="font-mono text-muted-foreground">Carregando concursos...</p>
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
                <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">V3</span>
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
      <nav className="border-b border-border bg-card/50 sticky top-0 z-40 backdrop-blur-sm">
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
                Motor de <span className="text-primary text-glow-primary">Cobertura V3</span>
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

            {/* Filtros Avançados */}
            <Accordion type="single" collapsible>
              <AccordionItem value="filtros">
                <AccordionTrigger>
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <Settings className="w-4 h-4" />
                    Filtros Avançados
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 stat-card">
                    <div>
                      <label className="text-xs font-mono text-muted-foreground">Pares (min-max)</label>
                      <div className="flex gap-1 mt-1">
                        <input type="number" min={0} max={15} value={filtros.pares_min} onChange={e => setFiltros(f => ({...f, pares_min: +e.target.value}))} className="w-full bg-secondary rounded px-2 py-1 text-xs font-mono text-foreground" />
                        <input type="number" min={0} max={15} value={filtros.pares_max} onChange={e => setFiltros(f => ({...f, pares_max: +e.target.value}))} className="w-full bg-secondary rounded px-2 py-1 text-xs font-mono text-foreground" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground">Soma (min-max)</label>
                      <div className="flex gap-1 mt-1">
                        <input type="number" value={filtros.soma_min} onChange={e => setFiltros(f => ({...f, soma_min: +e.target.value}))} className="w-full bg-secondary rounded px-2 py-1 text-xs font-mono text-foreground" />
                        <input type="number" value={filtros.soma_max} onChange={e => setFiltros(f => ({...f, soma_max: +e.target.value}))} className="w-full bg-secondary rounded px-2 py-1 text-xs font-mono text-foreground" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground">Repetidos (min-max)</label>
                      <div className="flex gap-1 mt-1">
                        <input type="number" min={0} max={15} value={filtros.repetidos_min} onChange={e => setFiltros(f => ({...f, repetidos_min: +e.target.value}))} className="w-full bg-secondary rounded px-2 py-1 text-xs font-mono text-foreground" />
                        <input type="number" min={0} max={15} value={filtros.repetidos_max} onChange={e => setFiltros(f => ({...f, repetidos_max: +e.target.value}))} className="w-full bg-secondary rounded px-2 py-1 text-xs font-mono text-foreground" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-muted-foreground">Humanidade máx.</label>
                      <input type="number" min={0} max={100} value={filtros.humanidade_max} onChange={e => setFiltros(f => ({...f, humanidade_max: +e.target.value}))} className="w-full bg-secondary rounded px-2 py-1 text-xs font-mono text-foreground mt-1" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="text-center space-y-2">
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
              {isGenerating && (
                <div className="max-w-md mx-auto">
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>

            {conjunto && (
              <>
                <div className="text-center">
                  <button
                    onClick={handleSaveApostas}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-secondary text-secondary-foreground font-mono text-xs transition-all hover:bg-primary/20"
                  >
                    <Bookmark className="w-4 h-4" />
                    Salvar para Conferir
                  </button>
                </div>

                <CoverageDisplay conjunto={conjunto} />

                <div id="apostas-export" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conjunto.apostas.map(aposta => (
                    <BetCardV2 key={aposta.id} aposta={aposta} />
                  ))}
                </div>

                <Suspense fallback={<div className="text-center font-mono text-xs text-muted-foreground">Carregando exportação...</div>}>
                  <ExportButtons targetId="apostas-export" />
                </Suspense>
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

        {/* Tab: Minhas Apostas */}
        {activeTab === "minhas_apostas" && (
          <motion.div key="minhas_apostas" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <HistoricoApostas historico={historicoApostas} sorteios={sorteios} onDelete={handleDeleteAposta} />
          </motion.div>
        )}

        {/* Tab: Análise */}
        {activeTab === "analise" && (
          <motion.div key="analise" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <FrequencyChart frequencias={frequencias} />
            <div className="grid md:grid-cols-2 gap-6">
              <ParityChart data={paridade} />
              {distribuicaoSoma && <SomaChart data={distribuicaoSoma.distribuicao} media={distribuicaoSoma.media} />}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
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
              {analise && <AtrasoChart atrasos={analise.atrasos_atuais} />}
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
              <BacktestV2Section data={backtestV2} sorteios={sorteios} filtros={filtros} />
            ) : (
              <p className="text-muted-foreground text-center font-mono">Carregando dados de backtest...</p>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-6 text-center">
          {ultimoSorteio && (
            <p className="text-xs font-mono text-muted-foreground mb-1">
              Dados atualizados até o concurso #{ultimoSorteio.concurso} ({ultimoSorteio.data})
            </p>
          )}
          <p className="text-xs font-mono text-muted-foreground">
            LOTOFÁCIL.AI V3 — Motor de Cobertura Combinatória • {sorteios.length} concursos •
            Não é previsão, é otimização
          </p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
};

export default Index;

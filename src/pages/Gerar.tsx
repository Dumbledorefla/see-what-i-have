import { useState, useCallback, useRef, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Zap, AlertTriangle, Loader2, Settings, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import { useLocalStorage } from "@/lib/hooks";
import type { Estrategia, ConjuntoOtimizado } from "@/lib/geradorApostas";
import type { WorkerInput, WorkerOutput } from "@/lib/generation.worker";
import type { Filtros } from "@/lib/lotofacilData";
import type { HistoricoConjunto } from "@/components/HistoricoApostas";
import StrategySelector from "@/components/StrategySelector";
import BudgetInput from "@/components/BudgetInput";
import ManualUniverseSelector from "@/components/ManualUniverseSelector";
import CoverageDisplay from "@/components/CoverageDisplay";
import BetCardV3 from "@/components/BetCardV3";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

const ExportButtons = lazy(() => import("@/components/ExportButtons"));

const Gerar = () => {
  const { sorteios, analise } = useData();
  const [conjunto, setConjunto] = useState<ConjuntoOtimizado | null>(null);
  const [estrategia, setEstrategia] = useState<Estrategia>("balanceada");
  const [orcamento, setOrcamento] = useState(99);
  const [manualUniverse, setManualUniverse] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
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
      if (type === "progress") setProgress(payload);
      else if (type === "result") {
        setConjunto(payload);
        setIsGenerating(false);
        toast.success(`${payload.apostas.length} apostas geradas com ${payload.cobertura_final_pct.toFixed(1)}% de cobertura!`);
      }
    };
    return () => { workerRef.current?.terminate(); };
  }, []);

  const nApostas = Math.floor(orcamento / 3.5);
  const ultimoSorteio = sorteios[sorteios.length - 1];

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
      dezenasUltimoSorteio: ultimoSorteio.dezenas,
      manualUniverse: estrategia === "manual" ? manualUniverse : undefined,
      filtros,
    };
    workerRef.current.postMessage(workerInput);
  }, [sorteios, analise, estrategia, nApostas, manualUniverse, filtros, ultimoSorteio]);

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
    toast.success(`Apostas para o concurso #${novoItem.concurso_alvo} salvas!`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <Zap className="w-6 h-6 inline-block mr-2 text-accent" />
          Gerar Apostas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Motor de cobertura combinatória • {sorteios.length} concursos analisados
        </p>
      </div>

      <StrategySelector value={estrategia} onChange={setEstrategia} />

      {estrategia === "manual" && (
        <ManualUniverseSelector selected={manualUniverse} onChange={setManualUniverse} />
      )}

      <BudgetInput value={orcamento} onChange={setOrcamento} />

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
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 glow-primary-strong"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando... {progress}%</>
          ) : (
            <><Zap className="w-4 h-4" /> Gerar {nApostas} Apostas Otimizadas</>
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
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-secondary text-secondary-foreground font-mono text-xs transition-all hover:bg-secondary/80"
            >
              <Bookmark className="w-4 h-4" /> Salvar para Conferir
            </button>
          </div>

          <CoverageDisplay conjunto={conjunto} />

          <div id="apostas-export" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {conjunto.apostas.map(aposta => (
              <BetCardV3 key={aposta.id} aposta={aposta} />
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
          <p className="font-bold text-accent mb-1">Aviso Legal</p>
          <p className="text-muted-foreground">
            Esta plataforma não prevê números da Lotofácil. Ela otimiza apostas com base em
            engenharia combinatória e fechamento de trios. A Lotofácil é um jogo de azar e
            não há garantia de ganho.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Gerar;

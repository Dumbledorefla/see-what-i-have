import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical, TrendingUp, TrendingDown, Loader2, Play } from "lucide-react";
import type { BacktestV2Result, Sorteio, Filtros } from "@/lib/lotofacilData";
import type { Estrategia } from "@/lib/geradorApostas";
import type { BacktestDynamicResult, BacktestWorkerInput, BacktestWorkerOutput } from "@/lib/backtest.worker";
import { Progress } from "@/components/ui/progress";

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface BacktestV2SectionProps {
  data: BacktestV2Result;
  sorteios: Sorteio[];
  filtros: Filtros;
}

const BacktestV2Section = ({ data, sorteios, filtros }: BacktestV2SectionProps) => {
  const { estrategia_otimizada: eo, baseline_medio: bl, alpha } = data;

  const [dynEstrategia, setDynEstrategia] = useState<Estrategia>("balanceada");
  const [dynPeriodo, setDynPeriodo] = useState(100);
  const [dynNApostas, setDynNApostas] = useState(28);
  const [isRunning, setIsRunning] = useState(false);
  const [btProgress, setBtProgress] = useState(0);
  const [dynamicResult, setDynamicResult] = useState<BacktestDynamicResult | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => { workerRef.current?.terminate(); };
  }, []);

  const handleRunBacktest = () => {
    if (sorteios.length === 0) return;

    workerRef.current?.terminate();
    workerRef.current = new Worker(new URL("../lib/backtest.worker.ts", import.meta.url), { type: "module" });

    workerRef.current.onmessage = (e: MessageEvent<BacktestWorkerOutput>) => {
      if (e.data.type === "progress") {
        setBtProgress(e.data.payload);
      } else if (e.data.type === "result") {
        setDynamicResult(e.data.payload);
        setIsRunning(false);
      }
    };

    setIsRunning(true);
    setBtProgress(0);
    setDynamicResult(null);

    const input: BacktestWorkerInput = {
      estrategia: dynEstrategia,
      nApostas: dynNApostas,
      periodo: dynPeriodo,
      sorteios,
      filtros,
    };
    workerRef.current.postMessage(input);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Backtest Controls */}
      <div className="stat-card p-4 space-y-4">
        <h3 className="font-mono font-bold text-foreground text-lg flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-accent" />
          BACKTEST DINÂMICO
        </h3>
        <p className="text-muted-foreground text-sm">
          Teste qualquer estratégia contra o histórico real. Escolha os parâmetros e rode.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-mono text-muted-foreground">Estratégia</label>
            <select
              value={dynEstrategia}
              onChange={e => setDynEstrategia(e.target.value as Estrategia)}
              disabled={isRunning}
              className="w-full bg-secondary rounded px-2 py-1.5 text-xs font-mono text-foreground mt-1"
            >
              <option value="conservadora">Conservadora</option>
              <option value="balanceada">Balanceada</option>
              <option value="agressiva">Agressiva</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground">Nº de Apostas</label>
            <input
              type="number"
              min={1}
              max={100}
              value={dynNApostas}
              onChange={e => setDynNApostas(+e.target.value)}
              disabled={isRunning}
              className="w-full bg-secondary rounded px-2 py-1.5 text-xs font-mono text-foreground mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground">Últimos Concursos</label>
            <input
              type="number"
              min={10}
              max={1000}
              step={10}
              value={dynPeriodo}
              onChange={e => setDynPeriodo(+e.target.value)}
              disabled={isRunning}
              className="w-full bg-secondary rounded px-2 py-1.5 text-xs font-mono text-foreground mt-1"
            />
          </div>
          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg bg-accent text-accent-foreground font-mono font-bold text-xs transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {btProgress}%
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Rodar
              </>
            )}
          </button>
        </div>

        {isRunning && (
          <div className="max-w-md mx-auto">
            <Progress value={btProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* Dynamic Result */}
      {dynamicResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="stat-card glow-primary text-center py-6">
            <h3 className="font-mono font-bold text-foreground text-lg mb-2">
              RESULTADO — {dynamicResult.estrategia.toUpperCase()}
            </h3>
            <p className="text-muted-foreground text-xs mb-4">
              {dynamicResult.concursos_testados} concursos • {dynamicResult.nApostas} apostas/concurso
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-mono font-bold text-accent">
                  {dynamicResult.alpha_roi > 0 ? "+" : ""}{dynamicResult.alpha_roi.toFixed(2)}
                </p>
                <p className="text-xs font-mono text-muted-foreground">p.p. Alpha (ROI)</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-accent">
                  {dynamicResult.alpha_retorno > 0 ? "+" : ""}R${formatCurrency(dynamicResult.alpha_retorno)}
                </p>
                <p className="text-xs font-mono text-muted-foreground">Retorno extra</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-foreground">{dynamicResult.roi.toFixed(2)}%</p>
                <p className="text-xs font-mono text-muted-foreground">ROI Otimizado</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-foreground">R${formatCurrency(dynamicResult.custo_total)}</p>
                <p className="text-xs font-mono text-muted-foreground">Custo total</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h4 className="font-mono font-bold text-foreground">OTIMIZADO</h4>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROI</span>
                  <span className="text-destructive font-bold">{dynamicResult.roi.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retorno</span>
                  <span>R${formatCurrency(dynamicResult.retorno_total)}</span>
                </div>
                {["11", "12", "13", "14", "15"].map(k => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground">Acertos {k}+</span>
                    <span className={k === "13" || k === "14" ? "text-accent font-bold" : ""}>{dynamicResult.acertos[k]}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conc. c/ prêmio</span>
                  <span>{dynamicResult.concursos_com_premio_pct}%</span>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-mono font-bold text-muted-foreground">BASELINE</h4>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROI</span>
                  <span className="text-destructive font-bold">{dynamicResult.baseline_roi.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retorno</span>
                  <span>R${formatCurrency(dynamicResult.baseline_retorno)}</span>
                </div>
                {["11", "12", "13", "14", "15"].map(k => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground">Acertos {k}+</span>
                    <span>{dynamicResult.baseline_acertos[k]}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conc. c/ prêmio</span>
                  <span>{dynamicResult.baseline_concursos_com_premio_pct}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Static data section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card glow-primary text-center py-6"
      >
        <h3 className="font-mono font-bold text-foreground text-xl mb-2">
          REFERÊNCIA ESTÁTICA
        </h3>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto mb-6">
          Dados pré-calculados: estratégia de cobertura vs. 1000 sorteios.
          ROI{" "}
          <span className="text-accent font-bold">{alpha.roi.toFixed(2)} p.p. maior</span>{" "}
          que apostas aleatórias.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-mono font-bold text-accent">+{alpha.roi.toFixed(2)}</p>
            <p className="text-xs font-mono text-muted-foreground">p.p. ROI (Alpha)</p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-accent">+R${formatCurrency(alpha.retorno)}</p>
            <p className="text-xs font-mono text-muted-foreground">Retorno extra</p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-accent">+{alpha.acertos_13.toFixed(0)}</p>
            <p className="text-xs font-mono text-muted-foreground">Acertos 13+ a mais</p>
          </div>
          <div>
            <p className="text-2xl font-mono font-bold text-foreground">1000</p>
            <p className="text-xs font-mono text-muted-foreground">Concursos testados</p>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h4 className="font-mono font-bold text-foreground">ESTRATÉGIA OTIMIZADA</h4>
          </div>
          <div className="space-y-3 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROI</span>
              <span className="text-destructive font-bold">{eo.roi.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retorno total</span>
              <span className="text-foreground">R${formatCurrency(eo.retorno_total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Custo total</span>
              <span className="text-foreground">R${formatCurrency(eo.custo_total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acertos 13+</span>
              <span className="text-accent font-bold">{eo.acertos["13"]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acertos 11+</span>
              <span className="text-foreground">{eo.acertos["11"]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concursos c/ prêmio</span>
              <span className="text-foreground">{eo.concursos_com_premio_pct}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-muted-foreground" />
            <h4 className="font-mono font-bold text-muted-foreground">BASELINE ALEATÓRIO</h4>
          </div>
          <div className="space-y-3 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ROI</span>
              <span className="text-destructive font-bold">{bl.roi.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retorno total</span>
              <span className="text-foreground">R${formatCurrency(bl.retorno_total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acertos 13+</span>
              <span className="text-foreground">{bl.acertos_13}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Acertos 14+</span>
              <span className="text-foreground">{bl.acertos_14}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concursos c/ prêmio</span>
              <span className="text-foreground">{bl.concursos_com_premio_pct}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
        <FlaskConical className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-mono font-bold text-accent mb-1">Sobre o Backtest</p>
          <p className="text-muted-foreground">
            O backtest dinâmico roda em tempo real no seu navegador via Web Worker.
            Para cada concurso no período, apostas são geradas usando o histórico anterior e comparadas
            com o resultado real. ROI negativo é esperado — o objetivo é maximizar o alpha sobre apostas aleatórias.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BacktestV2Section;

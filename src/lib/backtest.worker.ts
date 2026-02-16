import { gerarConjuntoOtimizado, selecionarUniverso, type Estrategia } from "./geradorApostas";
import { calcularAnaliseCompleta, type Sorteio, type Filtros } from "./lotofacilData";

export interface BacktestWorkerInput {
  estrategia: Estrategia;
  nApostas: number;
  periodo: number;
  sorteios: Sorteio[];
  filtros: Filtros;
}

export interface BacktestDynamicResult {
  estrategia: Estrategia;
  periodo: number;
  nApostas: number;
  roi: number;
  retorno_total: number;
  custo_total: number;
  acertos: Record<string, number>;
  concursos_com_premio: number;
  concursos_testados: number;
  concursos_com_premio_pct: number;
  // Baseline
  baseline_roi: number;
  baseline_retorno: number;
  baseline_acertos: Record<string, number>;
  baseline_concursos_com_premio_pct: number;
  // Alpha
  alpha_roi: number;
  alpha_retorno: number;
}

export interface BacktestWorkerOutput {
  type: "progress" | "result";
  payload: any;
}

const PREMIOS: Record<number, number> = {
  11: 6,
  12: 12,
  13: 30,
  14: 1500,
  15: 1500000,
};

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

self.onmessage = (e: MessageEvent<BacktestWorkerInput>) => {
  const { estrategia, nApostas, periodo, sorteios, filtros } = e.data;

  const sorteiosSlice = sorteios.slice(-periodo - 1);
  const total = sorteiosSlice.length - 1;

  const acertosOtimizado: Record<string, number> = { "11": 0, "12": 0, "13": 0, "14": 0, "15": 0 };
  const acertosBaseline: Record<string, number> = { "11": 0, "12": 0, "13": 0, "14": 0, "15": 0 };
  let retornoOtimizado = 0;
  let retornoBaseline = 0;
  let concursosComPremioOtimizado = 0;
  let concursosComPremioBaseline = 0;

  for (let i = 1; i < sorteiosSlice.length; i++) {
    const sorteioAtual = sorteiosSlice[i];
    const historico = sorteios.slice(0, sorteios.indexOf(sorteiosSlice[i]));

    if (historico.length < 100) continue;

    const analise = calcularAnaliseCompleta(historico);

    // Gerar apostas otimizadas
    const conjunto = gerarConjuntoOtimizado(
      estrategia,
      nApostas,
      analise,
      sorteiosSlice[i - 1].dezenas,
      undefined,
      undefined,
      filtros
    );

    // Gerar apostas aleatórias (baseline)
    const allNums = Array.from({ length: 25 }, (_, i) => i + 1);
    const baselineApostas = Array.from({ length: nApostas }, () =>
      shuffleArray(allNums).slice(0, 15).sort((a, b) => a - b)
    );

    let temPremioOtimizado = false;
    let temPremioBaseline = false;

    // Verificar acertos - otimizado
    for (const aposta of conjunto.apostas) {
      const acertos = aposta.dezenas.filter(d => sorteioAtual.dezenas.includes(d)).length;
      if (acertos >= 11) {
        acertosOtimizado[String(acertos)]++;
        retornoOtimizado += PREMIOS[acertos] || 0;
        temPremioOtimizado = true;
      }
    }

    // Verificar acertos - baseline
    for (const aposta of baselineApostas) {
      const acertos = aposta.filter(d => sorteioAtual.dezenas.includes(d)).length;
      if (acertos >= 11) {
        acertosBaseline[String(acertos)]++;
        retornoBaseline += PREMIOS[acertos] || 0;
        temPremioBaseline = true;
      }
    }

    if (temPremioOtimizado) concursosComPremioOtimizado++;
    if (temPremioBaseline) concursosComPremioBaseline++;

    // Reportar progresso a cada 10 iterações
    if (i % 10 === 0 || i === sorteiosSlice.length - 1) {
      self.postMessage({
        type: "progress",
        payload: Math.round((i / total) * 100),
      } as BacktestWorkerOutput);
    }
  }

  const custoTotal = nApostas * total * 3.5;
  const roiOtimizado = custoTotal > 0 ? ((retornoOtimizado - custoTotal) / custoTotal) * 100 : 0;
  const roiBaseline = custoTotal > 0 ? ((retornoBaseline - custoTotal) / custoTotal) * 100 : 0;

  const result: BacktestDynamicResult = {
    estrategia,
    periodo: total,
    nApostas,
    roi: roiOtimizado,
    retorno_total: retornoOtimizado,
    custo_total: custoTotal,
    acertos: acertosOtimizado,
    concursos_com_premio: concursosComPremioOtimizado,
    concursos_testados: total,
    concursos_com_premio_pct: total > 0 ? parseFloat(((concursosComPremioOtimizado / total) * 100).toFixed(1)) : 0,
    baseline_roi: roiBaseline,
    baseline_retorno: retornoBaseline,
    baseline_acertos: acertosBaseline,
    baseline_concursos_com_premio_pct: total > 0 ? parseFloat(((concursosComPremioBaseline / total) * 100).toFixed(1)) : 0,
    alpha_roi: parseFloat((roiOtimizado - roiBaseline).toFixed(2)),
    alpha_retorno: parseFloat((retornoOtimizado - retornoBaseline).toFixed(2)),
  };

  self.postMessage({ type: "result", payload: result } as BacktestWorkerOutput);
};

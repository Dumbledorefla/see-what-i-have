/**
 * Motor de Geração V2 — Fechamento Guloso (Greedy Set Cover)
 * Portado do Python motor_cobertura.py + gerador_v2.py
 */

import type { AnaliseCompleta, Filtros } from "./lotofacilData";

// --- Filtros ---

function countPares(aposta: number[]): number {
  return aposta.filter(n => n % 2 === 0).length;
}

function getSoma(aposta: number[]): number {
  return aposta.reduce((a, b) => a + b, 0);
}

function getFaixas(aposta: number[]): number[] {
  const faixas = [0, 0, 0, 0, 0];
  aposta.forEach(n => { faixas[Math.floor((n - 1) / 5)]++; });
  return faixas;
}

function scoreHumanidade(aposta: number[]): number {
  let score = 0;
  const sorted = [...aposta].sort((a, b) => a - b);

  // Only penalize sequences longer than 3 (matching official motor V2)
  let maxSeq = 0, currentSeq = 1;
  if (sorted.length > 1) {
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        currentSeq++;
      } else {
        maxSeq = Math.max(maxSeq, currentSeq);
        currentSeq = 1;
      }
    }
    maxSeq = Math.max(maxSeq, currentSeq);
  }
  if (maxSeq > 3) score += (maxSeq - 3) * 10;

  score += aposta.filter(n => n % 5 === 0).length * 5;

  const gradeSimetria = new Set([1, 5, 21, 25, 3, 13, 23]);
  score += aposta.filter(n => gradeSimetria.has(n)).length * 5;

  return Math.min(score, 100);
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// --- Types ---

export type Estrategia = "conservadora" | "balanceada" | "agressiva" | "manual";

export interface ApostaV2 {
  id: number;
  dezenas: number[];
  pares: number;
  soma: number;
  faixas: number[];
  humanidade_score: number;
  novos_trios_cobertos: number;
  cobertura_acumulada_pct: number;
}

export interface ConjuntoOtimizado {
  estrategia: Estrategia;
  universo: number[];
  total_trios: number;
  cobertura_final_pct: number;
  apostas: ApostaV2[];
  custo_total: number;
}

// --- Seleção de universo ---

export function selecionarUniverso(
  estrategia: Estrategia,
  analise: AnaliseCompleta,
  universoManual?: number[]
): number[] {
  const freqOrdenada = Object.entries(analise.frequencia_numeros)
    .sort(([, a], [, b]) => b - a)
    .map(([num]) => parseInt(num));

  switch (estrategia) {
    case "conservadora":
      return freqOrdenada.slice(0, 18);

    case "balanceada": {
      const top12 = freqOrdenada.slice(0, 12);
      const intermediarias = freqOrdenada.slice(12, 25);
      const bottom6 = shuffleArray(intermediarias).slice(0, 6);
      return [...new Set([...top12, ...bottom6])].sort((a, b) => a - b);
    }

    case "agressiva": {
      const atrasadasOrdenadas = Object.entries(analise.atrasos_atuais)
        .sort(([, a], [, b]) => b - a)
        .map(([num]) => parseInt(num));
      const top12 = freqOrdenada.slice(0, 12);
      const atrasadas6 = atrasadasOrdenadas.filter(n => !top12.includes(n)).slice(0, 6);
      return [...new Set([...top12, ...atrasadas6])].sort((a, b) => a - b);
    }

    case "manual":
      if (universoManual && universoManual.length >= 18) return universoManual;
      return freqOrdenada.slice(0, 18);
  }
}

// --- Gerador de aposta candidata ---

function gerarApostaCandidata(
  universo: number[],
  ultimoConcursoSet: Set<number>,
  filtros: Filtros
): number[] | null {
  for (let tentativas = 0; tentativas < 500; tentativas++) {
    const aposta = shuffleArray(universo).slice(0, 15).sort((a, b) => a - b);

    const pares = countPares(aposta);
    if (pares < filtros.pares_min || pares > filtros.pares_max) continue;

    const soma = getSoma(aposta);
    if (soma < filtros.soma_min || soma > filtros.soma_max) continue;

    const repetidos = aposta.filter(n => ultimoConcursoSet.has(n)).length;
    if (repetidos < filtros.repetidos_min || repetidos > filtros.repetidos_max) continue;

    if (scoreHumanidade(aposta) > filtros.humanidade_max) continue;

    return aposta;
  }
  return null;
}

// --- Trio key helper ---

function getTrioKeys(aposta: number[]): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < aposta.length - 2; i++) {
    for (let j = i + 1; j < aposta.length - 1; j++) {
      for (let k = j + 1; k < aposta.length; k++) {
        keys.add(`${aposta[i]}-${aposta[j]}-${aposta[k]}`);
      }
    }
  }
  return keys;
}

function getTotalTrios(universo: number[]): number {
  const n = universo.length;
  if (n < 3) return 0;
  return (n * (n - 1) * (n - 2)) / 6;
}

// --- Motor de Fechamento Guloso ---

function motorFechamentoGuloso(
  universo: number[],
  nApostas: number,
  ultimoConcursoSet: Set<number>,
  filtros: Filtros,
  nCandidatasPorIteracao: number = 200,
  onProgress?: (i: number, total: number) => void
): ApostaV2[] {
  const sortedUniverso = [...universo].sort((a, b) => a - b);
  const totalTrios = getTotalTrios(sortedUniverso);
  const elementosJaCobertos = new Set<string>();
  const apostas: ApostaV2[] = [];

  for (let i = 0; i < nApostas; i++) {
    let melhorAposta: number[] | null = null;
    let melhorNovos = new Set<string>();

    for (let c = 0; c < nCandidatasPorIteracao; c++) {
      const candidata = gerarApostaCandidata(sortedUniverso, ultimoConcursoSet, filtros);
      if (!candidata) continue;

      const trios = getTrioKeys(candidata);
      const novos = new Set<string>();
      trios.forEach(t => { if (!elementosJaCobertos.has(t)) novos.add(t); });

      if (novos.size > melhorNovos.size) {
        melhorAposta = candidata;
        melhorNovos = novos;
      }
    }

    if (!melhorAposta) {
      melhorAposta = shuffleArray(sortedUniverso).slice(0, 15).sort((a, b) => a - b);
      const trios = getTrioKeys(melhorAposta);
      melhorNovos = new Set<string>();
      trios.forEach(t => { if (!elementosJaCobertos.has(t)) melhorNovos.add(t); });
    }

    melhorNovos.forEach(t => elementosJaCobertos.add(t));

    const coberturaPct = totalTrios > 0 ? (elementosJaCobertos.size / totalTrios) * 100 : 100;

    apostas.push({
      id: i + 1,
      dezenas: melhorAposta,
      pares: countPares(melhorAposta),
      soma: getSoma(melhorAposta),
      faixas: getFaixas(melhorAposta),
      humanidade_score: scoreHumanidade(melhorAposta),
      novos_trios_cobertos: melhorNovos.size,
      cobertura_acumulada_pct: parseFloat(coberturaPct.toFixed(2)),
    });

    onProgress?.(i + 1, nApostas);
  }

  return apostas;
}

// --- Função principal V2 ---

export function gerarConjuntoOtimizado(
  estrategia: Estrategia,
  nApostas: number,
  analise: AnaliseCompleta,
  ultimoConcursoDezenas: number[],
  universoManual?: number[],
  onProgress?: (i: number, total: number) => void,
  filtros?: Filtros
): ConjuntoOtimizado {
  const universo = selecionarUniverso(estrategia, analise, universoManual);
  const ultimoSet = new Set(ultimoConcursoDezenas);

  const defaultFiltros: Filtros = {
    pares_min: 5,
    pares_max: 10,
    soma_min: 160,
    soma_max: 230,
    repetidos_min: 6,
    repetidos_max: 11,
    humanidade_max: 80,
  };

  const filtrosAtuais = filtros || defaultFiltros;

  const apostas = motorFechamentoGuloso(
    universo,
    nApostas,
    ultimoSet,
    filtrosAtuais,
    200,
    onProgress
  );

  const totalTrios = getTotalTrios(universo);
  const coberturaFinal = apostas.length > 0
    ? apostas[apostas.length - 1].cobertura_acumulada_pct
    : 0;

  return {
    estrategia,
    universo: [...universo].sort((a, b) => a - b),
    total_trios: totalTrios,
    cobertura_final_pct: coberturaFinal,
    apostas,
    custo_total: nApostas * 3,
  };
}

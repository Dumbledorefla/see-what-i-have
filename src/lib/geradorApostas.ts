/**
 * Gerador de Apostas Inteligentes - Lotofácil
 * Portado do Python para TypeScript
 */

function countPares(aposta: number[]): number {
  return aposta.filter(n => n % 2 === 0).length;
}

function getSoma(aposta: number[]): number {
  return aposta.reduce((a, b) => a + b, 0);
}

function getFaixas(aposta: number[]): number[] {
  const faixas = [0, 0, 0, 0, 0];
  aposta.forEach(n => {
    faixas[Math.floor((n - 1) / 5)]++;
  });
  return faixas;
}

function scoreHumanidade(aposta: number[]): number {
  let score = 0;
  const sorted = [...aposta].sort((a, b) => a - b);
  
  // Penalize long sequences
  let maxSeq = 1;
  let currentSeq = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      currentSeq++;
      maxSeq = Math.max(maxSeq, currentSeq);
    } else {
      currentSeq = 1;
    }
  }
  score += Math.min(maxSeq * 10, 30);
  
  // Penalize multiples of 5
  score += aposta.filter(n => n % 5 === 0).length * 5;
  
  // Penalize common "human" numbers
  const humanNumbers = new Set([1, 2, 3, 4, 5, 10, 12, 15, 20, 25]);
  score += aposta.filter(n => humanNumbers.has(n)).length * 5;
  
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

function sampleNumbers(count: number): number[] {
  const all = Array.from({ length: 25 }, (_, i) => i + 1);
  return shuffleArray(all).slice(0, count).sort((a, b) => a - b);
}

export interface ApostaIntelligente {
  dezenas: number[];
  pares: number;
  soma: number;
  faixas: number[];
  humanidade_score: number;
}

export function gerarApostasInteligentes(
  ultimoConcursoDezenas: number[],
  nApostas: number = 3,
  maxIterations: number = 50000
): ApostaIntelligente[] {
  const apostasFinais: ApostaIntelligente[] = [];
  const ultimoSet = new Set(ultimoConcursoDezenas);
  let iterations = 0;

  while (apostasFinais.length < nApostas && iterations < maxIterations) {
    iterations++;
    const aposta = sampleNumbers(15);
    
    const pares = countPares(aposta);
    if (pares < 5 || pares > 9) continue;
    
    const soma = getSoma(aposta);
    if (soma < 170 || soma > 220) continue;
    
    const hScore = scoreHumanidade(aposta);
    if (hScore > 60) continue;
    
    const apostaSet = new Set(aposta);
    const overlap = aposta.filter(n => ultimoSet.has(n)).length;
    if (overlap < 6 || overlap > 11) continue;
    
    // Ensure diversity
    const tooSimilar = apostasFinais.some(existente => {
      const existenteSet = new Set(existente.dezenas);
      const common = aposta.filter(n => existenteSet.has(n)).length;
      return common > 12;
    });
    if (tooSimilar) continue;
    
    apostasFinais.push({
      dezenas: aposta,
      pares,
      soma,
      faixas: getFaixas(aposta),
      humanidade_score: hScore,
    });
  }

  return apostasFinais;
}

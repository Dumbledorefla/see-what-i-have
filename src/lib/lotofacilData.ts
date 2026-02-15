export interface Sorteio {
  concurso: number;
  data: string;
  dezenas: number[];
  ganhadores_15: number;
  ganhadores_14: number;
  ganhadores_13: number;
}

export interface ApostaGerada {
  id: number;
  dezenas: number[];
  pares: number;
  soma: number;
  faixas: number[];
  humanidade_score: number;
}

export interface BacktestResult {
  aposta_id: number;
  dezenas: number[];
  acertos_11: number;
  acertos_12: number;
  acertos_13: number;
  acertos_14: number;
  acertos_15: number;
  custo_estimado: number;
  retorno_estimado: number;
  roi_estimado_pct: number;
}

export interface MonteCarloResult {
  aposta_id: number;
  dezenas: number[];
  sim_acertos_11: number;
  sim_acertos_12: number;
  sim_acertos_13: number;
  sim_acertos_14: number;
  sim_acertos_15: number;
}

export interface FrequenciaNumero {
  numero: number;
  frequencia: number;
  percentual: number;
}

export function parseCsvData(csvText: string): Sorteio[] {
  const lines = csvText.trim().split('\n');
  return lines.slice(1).map(line => {
    const parts = line.split(',');
    const concurso = parseInt(parts[0]);
    const data = parts[1];
    // dezenas are in quotes: "02,03,04,..."
    const dezenasMatch = line.match(/"(\d{2}(?:,\d{2})*?)"/);
    const dezenas = dezenasMatch
      ? dezenasMatch[1].split(',').map(Number)
      : [];
    
    // Find ganhadores from the end of the line
    const afterLastQuote = line.split('"');
    const trailing = afterLastQuote[afterLastQuote.length - 1].split(',').filter(s => s !== '');
    
    return {
      concurso,
      data,
      dezenas,
      ganhadores_15: parseInt(trailing[trailing.length - 3]) || 0,
      ganhadores_14: parseInt(trailing[trailing.length - 2]) || 0,
      ganhadores_13: parseInt(trailing[trailing.length - 1]) || 0,
    };
  }).filter(s => s.dezenas.length === 15);
}

export function calcularFrequencias(sorteios: Sorteio[]): FrequenciaNumero[] {
  const contagem: Record<number, number> = {};
  for (let i = 1; i <= 25; i++) contagem[i] = 0;
  
  sorteios.forEach(s => {
    s.dezenas.forEach(d => {
      contagem[d] = (contagem[d] || 0) + 1;
    });
  });
  
  return Array.from({ length: 25 }, (_, i) => ({
    numero: i + 1,
    frequencia: contagem[i + 1],
    percentual: parseFloat(((contagem[i + 1] / sorteios.length) * 100).toFixed(1)),
  }));
}

export function calcularDistribuicaoParidade(sorteios: Sorteio[]) {
  const dist: Record<number, number> = {};
  sorteios.forEach(s => {
    const pares = s.dezenas.filter(d => d % 2 === 0).length;
    dist[pares] = (dist[pares] || 0) + 1;
  });
  return Object.entries(dist)
    .map(([pares, freq]) => ({
      pares: parseInt(pares),
      frequencia: freq,
      percentual: parseFloat(((freq / sorteios.length) * 100).toFixed(1)),
    }))
    .sort((a, b) => a.pares - b.pares);
}

export function calcularDistribuicaoSoma(sorteios: Sorteio[]) {
  const somas = sorteios.map(s => s.dezenas.reduce((a, b) => a + b, 0));
  const min = Math.min(...somas);
  const max = Math.max(...somas);
  const media = parseFloat((somas.reduce((a, b) => a + b, 0) / somas.length).toFixed(2));
  
  // Group into ranges of 10
  const ranges: Record<string, number> = {};
  somas.forEach(s => {
    const rangeStart = Math.floor(s / 10) * 10;
    const key = `${rangeStart}-${rangeStart + 9}`;
    ranges[key] = (ranges[key] || 0) + 1;
  });
  
  return {
    min, max, media,
    distribuicao: Object.entries(ranges)
      .map(([faixa, freq]) => ({ faixa, frequencia: freq }))
      .sort((a, b) => parseInt(a.faixa) - parseInt(b.faixa)),
  };
}

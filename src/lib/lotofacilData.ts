export interface Sorteio {
  concurso: number;
  data: string;
  dezenas: number[];
  acumulado: boolean;
  ganhadores_15: number;
  valor_premio_15: number;
  ganhadores_14: number;
  valor_premio_14: number;
  ganhadores_13: number;
  valor_premio_13: number;
  ganhadores_12: number;
  ganhadores_11: number;
}

export interface AnaliseCompleta {
  total_concursos: number;
  frequencia_numeros: Record<string, number>;
  frequencia_esperada: number;
  paridade: {
    media_pares: number;
    desvio_padrao: number;
    distribuicao: Record<string, number>;
  };
  soma: {
    minima: number;
    maxima: number;
    media: number;
    mediana: number;
    desvio_padrao: number;
    intervalo_1sigma: [number, number];
  };
  repeticao_anterior: {
    media: number;
    desvio_padrao: number;
    distribuicao: Record<string, number>;
  };
  atrasos_atuais: Record<string, number>;
  probabilidades: Record<string, number>;
}

export interface BacktestV2Result {
  estrategia_otimizada: {
    roi: number;
    retorno_total: number;
    custo_total: number;
    acertos: Record<string, number>;
    concursos_com_premio_pct: number;
  };
  baseline_medio: {
    roi: number;
    retorno_total: number;
    acertos_13: number;
    acertos_14: number;
    concursos_com_premio_pct: number;
  };
  alpha: {
    roi: number;
    retorno: number;
    acertos_13: number;
    acertos_14: number;
  };
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

export interface FrequenciaNumero {
  numero: number;
  frequencia: number;
  percentual: number;
}

export function parseCsvCompleto(csvText: string): Sorteio[] {
  const lines = csvText.trim().split('\n');
  return lines.slice(1).map(line => {
    // CSV format: concurso,data,"d1,d2,...,d15",acumulado,valor_arrecadado,g15,v15,g14,v14,g13,v13,g12,v12,g11,v11
    const dezenasMatch = line.match(/"(\d{2}(?:,\d{2})*?)"/);
    const dezenas = dezenasMatch
      ? dezenasMatch[1].split(',').map(Number)
      : [];

    // Split before and after the quoted dezenas
    const beforeQuote = line.substring(0, line.indexOf('"'));
    const afterQuote = line.substring(line.lastIndexOf('"') + 1);

    const beforeParts = beforeQuote.split(',').filter(s => s !== '');
    const afterParts = afterQuote.split(',').filter(s => s !== '');

    const concurso = parseInt(beforeParts[0]);
    const data = beforeParts[1] || '';

    return {
      concurso,
      data,
      dezenas,
      acumulado: afterParts[0] === 'True',
      ganhadores_15: parseInt(afterParts[2]) || 0,
      valor_premio_15: parseFloat(afterParts[3]) || 0,
      ganhadores_14: parseInt(afterParts[4]) || 0,
      valor_premio_14: parseFloat(afterParts[5]) || 0,
      ganhadores_13: parseInt(afterParts[6]) || 0,
      valor_premio_13: parseFloat(afterParts[7]) || 0,
      ganhadores_12: parseInt(afterParts[8]) || 0,
      ganhadores_11: parseInt(afterParts[10]) || 0,
    };
  }).filter(s => s.dezenas.length === 15);
}

// Keep old parser for backward compat
export function parseCsvData(csvText: string): Sorteio[] {
  return parseCsvCompleto(csvText);
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

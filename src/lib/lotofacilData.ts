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

export interface Filtros {
  pares_min: number;
  pares_max: number;
  soma_min: number;
  soma_max: number;
  repetidos_min: number;
  repetidos_max: number;
  humanidade_max: number;
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

// MELHORIA 3: Calcula AnaliseCompleta a partir dos sorteios
export function calcularAnaliseCompleta(sorteios: Sorteio[]): AnaliseCompleta {
  const total = sorteios.length;

  // Frequência de cada número
  const freqMap: Record<string, number> = {};
  for (let i = 1; i <= 25; i++) freqMap[String(i)] = 0;
  sorteios.forEach(s => s.dezenas.forEach(d => { freqMap[String(d)]++; }));

  const frequencia_esperada = parseFloat(((total * 15) / 25).toFixed(2));

  // Paridade
  const paresArr = sorteios.map(s => s.dezenas.filter(d => d % 2 === 0).length);
  const mediaPares = paresArr.reduce((a, b) => a + b, 0) / total;
  const dpPares = Math.sqrt(paresArr.reduce((sum, p) => sum + (p - mediaPares) ** 2, 0) / total);
  const distPares: Record<string, number> = {};
  paresArr.forEach(p => { distPares[String(p)] = (distPares[String(p)] || 0) + 1; });

  // Soma
  const somas = sorteios.map(s => s.dezenas.reduce((a, b) => a + b, 0));
  const mediaSoma = somas.reduce((a, b) => a + b, 0) / total;
  const dpSoma = Math.sqrt(somas.reduce((sum, s) => sum + (s - mediaSoma) ** 2, 0) / total);
  const sortedSomas = [...somas].sort((a, b) => a - b);
  const mediana = sortedSomas[Math.floor(total / 2)];

  // Repetição com concurso anterior
  const reps: number[] = [];
  for (let i = 1; i < sorteios.length; i++) {
    const prev = new Set(sorteios[i - 1].dezenas);
    const rep = sorteios[i].dezenas.filter(d => prev.has(d)).length;
    reps.push(rep);
  }
  const mediaRep = reps.length > 0 ? reps.reduce((a, b) => a + b, 0) / reps.length : 0;
  const dpRep = reps.length > 0 ? Math.sqrt(reps.reduce((sum, r) => sum + (r - mediaRep) ** 2, 0) / reps.length) : 0;
  const distRep: Record<string, number> = {};
  reps.forEach(r => { distRep[String(r)] = (distRep[String(r)] || 0) + 1; });

  // Atrasos atuais
  const atrasos: Record<string, number> = {};
  const ultimoConcursoIdx = sorteios.length - 1;
  for (let num = 1; num <= 25; num++) {
    let atraso = 0;
    for (let i = ultimoConcursoIdx; i >= 0; i--) {
      if (sorteios[i].dezenas.includes(num)) break;
      atraso++;
    }
    atrasos[String(num)] = atraso;
  }

  // Probabilidades (frequência relativa)
  const probabilidades: Record<string, number> = {};
  for (let i = 1; i <= 25; i++) {
    probabilidades[String(i)] = parseFloat((freqMap[String(i)] / total).toFixed(6));
  }

  return {
    total_concursos: total,
    frequencia_numeros: freqMap,
    frequencia_esperada,
    paridade: {
      media_pares: parseFloat(mediaPares.toFixed(2)),
      desvio_padrao: parseFloat(dpPares.toFixed(2)),
      distribuicao: distPares,
    },
    soma: {
      minima: Math.min(...somas),
      maxima: Math.max(...somas),
      media: parseFloat(mediaSoma.toFixed(2)),
      mediana,
      desvio_padrao: parseFloat(dpSoma.toFixed(2)),
      intervalo_1sigma: [
        parseFloat((mediaSoma - dpSoma).toFixed(2)),
        parseFloat((mediaSoma + dpSoma).toFixed(2)),
      ],
    },
    repeticao_anterior: {
      media: parseFloat(mediaRep.toFixed(2)),
      desvio_padrao: parseFloat(dpRep.toFixed(2)),
      distribuicao: distRep,
    },
    atrasos_atuais: atrasos,
    probabilidades,
  };
}

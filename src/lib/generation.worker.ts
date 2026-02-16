import { gerarConjuntoOtimizado, type Estrategia, type ConjuntoOtimizado } from "./geradorApostas";
import type { AnaliseCompleta, Filtros } from "./lotofacilData";

export interface WorkerInput {
  estrategia: Estrategia;
  nApostas: number;
  analise: AnaliseCompleta;
  dezenasUltimoSorteio: number[];
  manualUniverse?: number[];
  filtros: Filtros;
}

export interface WorkerOutput {
  type: "progress" | "result";
  payload: any;
}

// Escuta por mensagens da thread principal
self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { estrategia, nApostas, analise, dezenasUltimoSorteio, manualUniverse, filtros } = e.data;

  const handleProgress = (i: number, total: number) => {
    const progress = Math.round((i / total) * 100);
    self.postMessage({ type: "progress", payload: progress } as WorkerOutput);
  };

  const result: ConjuntoOtimizado = gerarConjuntoOtimizado(
    estrategia,
    nApostas,
    analise,
    dezenasUltimoSorteio,
    manualUniverse,
    handleProgress,
    filtros
  );

  self.postMessage({ type: "result", payload: result } as WorkerOutput);
};

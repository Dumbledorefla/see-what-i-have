import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { parseCsvCompleto, type Sorteio, type AnaliseCompleta, type BacktestV2Result } from "@/lib/lotofacilData";

interface DataContextType {
  sorteios: Sorteio[];
  analise: AnaliseCompleta | null;
  backtestV2: BacktestV2Result | null;
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  sorteios: [],
  analise: null,
  backtestV2: null,
  loading: true,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [analise, setAnalise] = useState<AnaliseCompleta | null>(null);
  const [backtestV2, setBacktestV2] = useState<BacktestV2Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/lotofacil_completo.csv").then(r => r.text()),
      fetch("/data/analise_completa.json").then(r => r.json()),
      fetch("/data/backtest_resultados.json").then(r => r.json()),
    ])
      .then(([csvText, analiseData, backtestData]) => {
        setSorteios(parseCsvCompleto(csvText));
        setAnalise(analiseData);
        setBacktestV2(backtestData);
      })
      .catch(error => {
        console.error("Erro ao carregar dados:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DataContext.Provider value={{ sorteios, analise, backtestV2, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

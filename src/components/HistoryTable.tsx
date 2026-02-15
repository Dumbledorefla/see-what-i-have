import { useState } from "react";
import type { Sorteio } from "@/lib/lotofacilData";
import NumberGrid from "./NumberGrid";

interface HistoryTableProps {
  sorteios: Sorteio[];
}

const HistoryTable = ({ sorteios }: HistoryTableProps) => {
  const [page, setPage] = useState(0);
  const [selectedConcurso, setSelectedConcurso] = useState<Sorteio | null>(null);
  const perPage = 15;
  const totalPages = Math.ceil(sorteios.length / perPage);
  const reversed = [...sorteios].reverse();
  const slice = reversed.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="stat-card">
      <h3 className="font-mono font-bold text-primary text-lg mb-4">
        HISTÓRICO DE SORTEIOS
      </h3>

      <div className="flex gap-4">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">Data</th>
                <th className="text-left py-2 px-2">Dezenas</th>
                <th className="text-right py-2 px-2">15</th>
                <th className="text-right py-2 px-2">14</th>
                <th className="text-right py-2 px-2">13</th>
              </tr>
            </thead>
            <tbody>
              {slice.map(s => (
                <tr
                  key={s.concurso}
                  onClick={() => setSelectedConcurso(s)}
                  className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-secondary/50 ${
                    selectedConcurso?.concurso === s.concurso ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="py-2 px-2 text-primary font-bold">{s.concurso}</td>
                  <td className="py-2 px-2 text-muted-foreground">{s.data}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-wrap gap-1">
                      {s.dezenas.map(d => (
                        <span key={d} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {String(d).padStart(2, "0")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className={s.ganhadores_15 > 0 ? "text-accent font-bold" : "text-muted-foreground"}>
                      {s.ganhadores_15}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-muted-foreground">{s.ganhadores_14}</td>
                  <td className="py-2 px-2 text-right text-muted-foreground">{s.ganhadores_13}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-xs font-mono px-3 py-1.5 rounded bg-secondary text-secondary-foreground disabled:opacity-30 hover:bg-secondary/80 transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-xs font-mono text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="text-xs font-mono px-3 py-1.5 rounded bg-secondary text-secondary-foreground disabled:opacity-30 hover:bg-secondary/80 transition-colors"
            >
              Próxima →
            </button>
          </div>
        </div>

        {selectedConcurso && (
          <div className="hidden lg:block w-48 flex-shrink-0">
            <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
              Concurso {selectedConcurso.concurso}
            </p>
            <NumberGrid activeNumbers={selectedConcurso.dezenas} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;

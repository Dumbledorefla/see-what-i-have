import type { ConjuntoOtimizado } from '@/lib/geradorApostas';
import type { Sorteio } from '@/lib/lotofacilData';
import { motion } from 'framer-motion';
import { Award, Calendar, Clock, Clover, Hash, Trash2 } from 'lucide-react';
import BetCardV2 from './BetCardV2';

export interface ResultadoConferencia {
  acertos: Record<string, number>;
  retorno_total: number;
}

export interface HistoricoConjunto {
  id: number;
  concurso_alvo: number;
  data_salvo: string;
  conjunto: ConjuntoOtimizado;
  status: 'aguardando' | 'conferido';
  resultado?: ResultadoConferencia;
}

interface HistoricoApostasProps {
  historico: HistoricoConjunto[];
  sorteios: Sorteio[];
  onDelete: (id: number) => void;
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const HistoricoApostas = ({ historico, sorteios, onDelete }: HistoricoApostasProps) => {
  if (historico.length === 0) {
    return (
      <div className="text-center py-16 stat-card">
        <Clover className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-mono font-bold text-lg">Nenhuma aposta salva</h3>
        <p className="text-muted-foreground text-sm">
          Gere um conjunto e clique em "Salvar para Conferir" para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {[...historico].sort((a, b) => b.id - a.id).map(item => {
        const sorteioRealizado = sorteios.find(s => s.concurso === item.concurso_alvo);
        const dezenasSorteadas = sorteioRealizado?.dezenas || [];

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="stat-card p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-mono font-bold text-primary text-lg flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Apostas para o Concurso #{item.concurso_alvo}
                </h3>
                <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3 h-3" /> Salvo em {item.data_salvo}
                  <span className="px-1">•</span>
                  <span>
                    {item.conjunto.apostas.length} apostas ({item.conjunto.estrategia})
                  </span>
                </p>
              </div>
              <button
                onClick={() => onDelete(item.id)}
                className="text-muted-foreground hover:text-destructive p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              {item.status === 'aguardando' && (
                <div className="flex items-center gap-2 text-sm font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-md px-3 py-2">
                  <Clock className="w-4 h-4" />
                  Aguardando resultado do concurso #{item.concurso_alvo}
                </div>
              )}
              {item.status === 'conferido' && item.resultado && (
                <div className="flex items-center gap-2 text-sm font-mono text-primary bg-primary/10 border border-primary/20 rounded-md px-3 py-2">
                  <Award className="w-4 h-4" />
                  Conferido! Retorno total:{' '}
                  <span className="font-bold text-lg">
                    {formatCurrency(item.resultado.retorno_total)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {item.conjunto.apostas.map(aposta => (
                <BetCardV2
                  key={aposta.id}
                  aposta={aposta}
                  dezenasSorteadas={dezenasSorteadas}
                />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HistoricoApostas;

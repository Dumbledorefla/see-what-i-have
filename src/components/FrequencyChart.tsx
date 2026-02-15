import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { FrequenciaNumero } from "@/lib/lotofacilData";

interface FrequencyChartProps {
  frequencias: FrequenciaNumero[];
}

const FrequencyChart = ({ frequencias }: FrequencyChartProps) => {
  const sorted = [...frequencias].sort((a, b) => a.numero - b.numero);
  const maxFreq = Math.max(...sorted.map(f => f.frequencia));
  const minFreq = Math.min(...sorted.map(f => f.frequencia));

  return (
    <div className="stat-card">
      <h3 className="font-mono font-bold text-primary text-lg mb-1">
        FREQUÊNCIA DOS NÚMEROS
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        Aparições em todos os concursos
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <XAxis
              dataKey="numero"
              tick={{ fill: "hsl(220 10% 50%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: "hsl(220 14% 18%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(220 10% 50%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              domain={[minFreq - 5, maxFreq + 5]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(220 18% 10%)",
                border: "1px solid hsl(220 14% 18%)",
                borderRadius: 8,
                fontFamily: "JetBrains Mono",
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(142 72% 50%)" }}
              formatter={(value: number) => [`${value}x`, "Frequência"]}
              labelFormatter={(label) => `Número ${String(label).padStart(2, "0")}`}
            />
            <Bar dataKey="frequencia" radius={[3, 3, 0, 0]}>
              {sorted.map((entry) => {
                const intensity = (entry.frequencia - minFreq) / (maxFreq - minFreq);
                return (
                  <Cell
                    key={entry.numero}
                    fill={`hsl(142 72% ${35 + intensity * 25}%)`}
                    opacity={0.6 + intensity * 0.4}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FrequencyChart;

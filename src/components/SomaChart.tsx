import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SomaChartProps {
  data: { faixa: string; frequencia: number }[];
  media: number;
}

const SomaChart = ({ data, media }: SomaChartProps) => {
  const mediaRangeStart = Math.floor(media / 10) * 10;

  return (
    <div className="stat-card">
      <h3 className="font-mono font-bold text-primary text-lg mb-1">
        DISTRIBUIÇÃO DE SOMA
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        Soma das 15 dezenas por sorteio
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="faixa" tick={{ fill: "hsl(215 20% 50%)", fontSize: 10 }} />
            <YAxis tick={{ fill: "hsl(215 20% 50%)", fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: "hsl(224 71% 8%)", border: "1px solid hsl(217 33% 22%)", borderRadius: 8 }}
              formatter={(value: number) => [`${value}x`, "Frequência"]}
              labelFormatter={(label) => `Faixa ${label}`}
            />
            <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
              {data.map((entry) => {
                const rangeStart = parseInt(entry.faixa.split('-')[0]);
                const isMediaRange = rangeStart === mediaRangeStart;
                return (
                  <Cell
                    key={entry.faixa}
                    fill={isMediaRange ? "hsl(160 100% 39%)" : "hsl(262 84% 60%)"}
                    opacity={isMediaRange ? 1 : 0.6}
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

export default SomaChart;

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ParityChartProps {
  data: { pares: number; frequencia: number; percentual: number }[];
}

const ParityChart = ({ data }: ParityChartProps) => {
  const maxFreq = Math.max(...data.map(d => d.frequencia));

  return (
    <div className="stat-card">
      <h3 className="font-mono font-bold text-primary text-lg mb-1">
        DISTRIBUIÇÃO DE PARIDADE
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        Quantidade de números pares por sorteio
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <XAxis
              dataKey="pares"
              tick={{ fill: "hsl(215 20% 50%)", fontSize: 11 }}
              axisLine={{ stroke: "hsl(217 33% 22%)" }}
              tickLine={false}
              tickFormatter={(v) => `${v}P`}
            />
            <YAxis
              tick={{ fill: "hsl(215 20% 50%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(224 71% 8%)",
                border: "1px solid hsl(217 33% 22%)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, _: string, props: any) => [
                `${value}x (${props.payload.percentual}%)`,
                "Frequência",
              ]}
              labelFormatter={(l) => `${l} pares / ${15 - Number(l)} ímpares`}
            />
            <Bar dataKey="frequencia" radius={[3, 3, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.pares}
                  fill={entry.frequencia === maxFreq ? "hsl(160 100% 39%)" : "hsl(160 100% 39% / 0.4)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ParityChart;

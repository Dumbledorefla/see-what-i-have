import { motion } from "framer-motion";

interface ManualUniverseSelectorProps {
  selected: number[];
  onChange: (nums: number[]) => void;
}

const ManualUniverseSelector = ({ selected, onChange }: ManualUniverseSelectorProps) => {
  const selectedSet = new Set(selected);

  const toggle = (num: number) => {
    if (selectedSet.has(num)) {
      onChange(selected.filter(n => n !== num));
    } else {
      onChange([...selected, num].sort((a, b) => a - b));
    }
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Selecione 18-20 dezenas para seu universo
        </p>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
          selected.length >= 18 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
        }`}>
          {selected.length}/25
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggle(num)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all duration-200 ${
              selectedSet.has(num)
                ? "number-ball-active"
                : "number-ball-inactive hover:bg-secondary/80"
            }`}
          >
            {String(num).padStart(2, "0")}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ManualUniverseSelector;

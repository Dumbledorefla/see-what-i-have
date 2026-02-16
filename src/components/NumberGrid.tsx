import { motion } from "framer-motion";

interface NumberGridProps {
  activeNumbers?: number[];
  highlightedNumbers?: number[];
  size?: "sm" | "md";
}

const NumberGrid = ({ activeNumbers = [], highlightedNumbers = [], size = "md" }: NumberGridProps) => {
  const activeSet = new Set(activeNumbers);
  const highlightSet = new Set(highlightedNumbers);
  const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => {
        const isActive = activeSet.has(num);
        const isHighlighted = highlightSet.size > 0 && highlightSet.has(num);
        const isActiveAndHighlighted = isActive && isHighlighted;
        const isActiveButMissed = isActive && highlightSet.size > 0 && !isHighlighted;

        let className = `${sizeClasses} rounded-full flex items-center justify-center font-mono font-bold transition-all duration-300 `;

        if (isActiveAndHighlighted) {
          className += "bg-green-500 text-white shadow-lg shadow-green-500/50 ring-2 ring-green-400";
        } else if (isActiveButMissed) {
          className += "bg-destructive/30 text-destructive border border-destructive/50";
        } else if (isActive) {
          className += "number-ball-active";
        } else {
          className += "number-ball-inactive";
        }

        return (
          <motion.div
            key={num}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: num * 0.02 }}
            className={className}
          >
            {String(num).padStart(2, "0")}
          </motion.div>
        );
      })}
    </div>
  );
};

export default NumberGrid;

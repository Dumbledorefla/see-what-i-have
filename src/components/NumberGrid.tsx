import { motion } from "framer-motion";

interface NumberGridProps {
  activeNumbers?: number[];
  size?: "sm" | "md";
}

const NumberGrid = ({ activeNumbers = [], size = "md" }: NumberGridProps) => {
  const activeSet = new Set(activeNumbers);
  const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
        <motion.div
          key={num}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: num * 0.02 }}
          className={`${sizeClasses} rounded-full flex items-center justify-center font-mono font-bold transition-all duration-300 ${
            activeSet.has(num)
              ? "number-ball-active"
              : "number-ball-inactive"
          }`}
        >
          {String(num).padStart(2, "0")}
        </motion.div>
      ))}
    </div>
  );
};

export default NumberGrid;

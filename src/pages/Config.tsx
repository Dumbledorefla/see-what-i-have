import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import GlassCard from "@/components/GlassCard";

const Config = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        <Settings className="w-6 h-6 inline-block mr-2 text-primary" />
        Configurações
      </h1>
      <p className="text-muted-foreground text-sm mt-1">
        Preferências da aplicação
      </p>
    </div>

    <GlassCard>
      <h3 className="font-mono font-bold text-primary mb-2">Em breve</h3>
      <p className="text-muted-foreground text-sm">
        Opções de tema, notificações e personalização serão adicionadas em futuras atualizações.
      </p>
    </GlassCard>
  </motion.div>
);

export default Config;

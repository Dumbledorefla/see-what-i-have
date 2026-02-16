import { Clover } from "lucide-react";

const Header = () => (
  <header className="md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
        <Clover className="w-4 h-4 text-primary" />
      </div>
      <h1 className="font-mono font-bold text-sm text-foreground tracking-tight">
        LOTOFÁCIL<span className="text-primary">.AI</span>
      </h1>
    </div>
  </header>
);

export default Header;

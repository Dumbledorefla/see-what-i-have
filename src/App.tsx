import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Gerar from "@/pages/Gerar";
import Analise from "@/pages/Analise";
import MinhasApostas from "@/pages/MinhasApostas";
import Historico from "@/pages/Historico";
import Backtest from "@/pages/Backtest";
import Config from "@/pages/Config";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/gerar" element={<Gerar />} />
              <Route path="/analise" element={<Analise />} />
              <Route path="/minhas-apostas" element={<MinhasApostas />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/backtest" element={<Backtest />} />
              <Route path="/config" element={<Config />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

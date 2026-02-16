import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useData } from "@/contexts/DataContext";
import { Clover } from "lucide-react";

const Layout = () => {
  const { loading } = useData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clover className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="font-mono text-muted-foreground text-sm">Carregando concursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />
      <main className="md:ml-64 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;

import { FileDown, ImageDown, Loader2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExportButtonsProps {
  targetId: string;
}

const ExportButtons = ({ targetId }: ExportButtonsProps) => {
  const [isExporting, setIsExporting] = useState<"pdf" | "png" | null>(null);

  const exportAs = async (format: "pdf" | "png") => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setIsExporting(format);

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#10111a",
        scale: 2,
      });

      if (format === "png") {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "apostas-lotofacil-ai.png";
        link.href = image;
        link.click();
      } else {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("apostas-lotofacil-ai.pdf");
      }
    } catch (e) {
      console.error("Export failed:", e);
    }

    setIsExporting(null);
  };

  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => exportAs("pdf")}
        disabled={!!isExporting}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-mono text-xs transition-all hover:bg-secondary/80 disabled:opacity-50"
      >
        {isExporting === "pdf" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        Exportar PDF
      </button>
      <button
        onClick={() => exportAs("png")}
        disabled={!!isExporting}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-mono text-xs transition-all hover:bg-secondary/80 disabled:opacity-50"
      >
        {isExporting === "png" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImageDown className="w-4 h-4" />
        )}
        Salvar Imagem
      </button>
    </div>
  );
};

export default ExportButtons;

"use client";

import { FileEdit, Sparkles } from "lucide-react";

interface QuickNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

const PRESET_PILLS = [
  "Tamanho M",
  "Tamanho L",
  "Tamanho 42 EU",
  "Novo c/ etiqueta",
  "Como novo / Pouco uso",
  "Pequena marca de uso",
  "Com caixa original",
  "Comprado há 2 meses",
  "Envio rápido em 24h",
  "100% Autêntico",
];

export function QuickNotes({ notes, onNotesChange }: QuickNotesProps) {
  const appendPill = (pillText: string) => {
    if (!notes.trim()) {
      onNotesChange(pillText);
    } else {
      if (!notes.includes(pillText)) {
        onNotesChange(`${notes.trim()}, ${pillText}`);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-dark-muted flex items-center gap-1.5">
          <FileEdit className="w-3.5 h-3.5 text-vinted-400" />
          Notas Rápidas (Opcional)
        </label>
        <span className="text-[10px] text-dark-muted">Ajuda a IA a ser 100% precisa</span>
      </div>

      <div className="relative">
        <textarea
          data-selectable="true"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Ex: Tamanho M, comprado há 2 meses, pequena marca na manga, 100% original..."
          rows={3}
          className="w-full bg-dark-card border border-dark-border/80 focus:border-vinted-500 rounded-2xl p-3 text-xs text-slate-100 placeholder:text-dark-muted/60 focus:outline-none transition-colors resize-none leading-relaxed"
        />
      </div>

      {/* Quick Tap Pills for iPhone */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <span className="text-[10px] text-dark-muted shrink-0 flex items-center gap-1 pl-0.5">
          <Sparkles className="w-3 h-3 text-vinted-400" />
          Sugestões:
        </span>
        {PRESET_PILLS.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => appendPill(pill)}
            className="shrink-0 text-[11px] bg-dark-surface hover:bg-dark-card border border-dark-border hover:border-vinted-500/50 text-slate-300 hover:text-white px-2.5 py-1 rounded-full transition-all active:scale-95"
          >
            + {pill}
          </button>
        ))}
      </div>
    </div>
  );
}

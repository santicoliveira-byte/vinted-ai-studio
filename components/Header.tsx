"use client";

import { Sparkles, SlidersHorizontal, X } from "lucide-react";

interface HeaderProps {
  onOpenSettings: () => void;
  hasCustomKey: boolean;
  selectedModel?: string;
  isSettingsOpen?: boolean;
}

export function Header({
  onOpenSettings,
  hasCustomKey,
  selectedModel = "gemini-2.5-flash",
  isSettingsOpen = false,
}: HeaderProps) {
  const modelLabels: Record<string, string> = {
    "gemini-2.5-flash": "Gemini 2.5 Flash",
    "gemini-3.8-flash": "Gemini 3.8 Flash",
    "gemini-2.5-pro": "Gemini 2.5 Pro",
  };

  const currentModelName = modelLabels[selectedModel] || "Gemini 2.5 Flash";

  return (
    <header className="sticky top-0 z-40 bg-dark-bg/85 backdrop-blur-md border-b border-dark-border/60 px-4 pb-3 pt-ios-top transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-vinted-400 via-vinted-500 to-vinted-700 flex items-center justify-center shadow-teal-glow">
            <span className="font-black text-white text-base tracking-tighter">V</span>
            <Sparkles className="w-3.5 h-3.5 text-white absolute -top-1 -right-1 drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm tracking-tight text-white">Vinted AI Studio</h1>
              <span className="bg-vinted-500/20 text-vinted-300 border border-vinted-500/40 text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-dark-muted font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-300">{currentModelName}</span>
              {hasCustomKey && (
                <span className="text-vinted-400 font-semibold">• Chave Ativa</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className={`p-2 rounded-xl border active:scale-95 transition-all flex items-center justify-center ${
            isSettingsOpen
              ? "bg-vinted-500 border-vinted-400 text-white shadow-teal-glow"
              : "bg-dark-surface border-dark-border/80 text-slate-300 hover:text-white hover:border-vinted-500/50"
          }`}
          title={isSettingsOpen ? "Fechar Definições" : "Definições e Chave API"}
          aria-label={isSettingsOpen ? "Fechar Definições" : "Abrir Definições"}
        >
          {isSettingsOpen ? (
            <X className="w-4 h-4 stroke-[2.5px]" />
          ) : (
            <SlidersHorizontal className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}

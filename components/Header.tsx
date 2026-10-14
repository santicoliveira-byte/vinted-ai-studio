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
  selectedModel = "gemini-3.1-flash",
  isSettingsOpen = false,
}: HeaderProps) {
  const modelLabels: Record<string, string> = {
    "gemini-3.1-flash": "Gemini 3.1 Flash",
    "gemini-3.8-flash": "Gemini 3.8 Flash",
    "gemini-3.1-pro-preview": "Gemini 3.1 Pro",
    "gemini-3.1-pro": "Gemini 3.1 Pro",
    "gemini-3-flash-preview": "Gemini 3 Flash",
  };

  const currentModelName = modelLabels[selectedModel] || "Gemini 3.1 Flash";

  return (
    <header className="sticky top-0 z-40 bg-dark-bg/85 backdrop-blur-md border-b border-dark-border/60 px-4 pb-3 pt-ios-top transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-teal-glow shrink-0 border border-vinted-500/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/apple-touch-icon.png"
              alt="Vinted AI Studio"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
              Vinted AI Studio
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-dark-muted font-medium mt-0.5">
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

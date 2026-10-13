"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Zap,
  Target,
  TrendingUp,
  Tag,
  FolderTree,
  ExternalLink,
  RotateCcw,
  Sparkles,
  BookmarkCheck,
  BookmarkPlus,
} from "lucide-react";
import confetti from "canvas-confetti";
import { GeminiListingResult } from "@/types";

interface ResultViewProps {
  result: GeminiListingResult;
  onReset: () => void;
  onSaveToInventory?: (result: GeminiListingResult, chosenPrice: number) => void;
  isSavedToInventory?: boolean;
}

export function ResultView({
  result,
  onReset,
  onSaveToInventory,
  isSavedToInventory = false,
}: ResultViewProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [savedLocally, setSavedLocally] = useState(isSavedToInventory);
  const [selectedPriceForSave, setSelectedPriceForSave] = useState<number>(
    result.precos.preco_justo.valor
  );

  // Build the complete listing description that goes straight into Vinted
  const fullListingText = `${result.descricao_pt.trim()}

${result.traducao_es_fr.trim()}

${result.hashtags.join(" ")}`;

  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopiedSection(sectionId);
      triggerConfetti();

      // Clear copied feedback after 2.5s
      setTimeout(() => {
        setCopiedSection((prev) => (prev === sectionId ? null : prev));
      }, 2500);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#007782", "#00a8b5", "#10b981", "#ffffff"],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore
    }
  };

  const handleSaveInventory = () => {
    if (onSaveToInventory) {
      onSaveToInventory(result, selectedPriceForSave);
      setSavedLocally(true);
      triggerConfetti();
    }
  };

  const openVintedApp = () => {
    window.location.href = "vinted://";
    setTimeout(() => {
      window.open("https://www.vinted.pt", "_blank");
    }, 500);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner with Brand and Category */}
      <div className="bg-gradient-to-r from-vinted-900/60 via-dark-card to-dark-surface border border-vinted-500/30 rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-vinted-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Anúncio Otimizado c/ Sucesso
          </span>
          {result.marca_detetada && (
            <span className="bg-dark-bg/80 border border-dark-border text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {result.marca_detetada}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <FolderTree className="w-3.5 h-3.5 text-vinted-400 shrink-0" />
          <span className="text-dark-muted">Categoria sugerida:</span>
          <span className="text-white font-semibold truncate">
            {result.categoria_sugerida}
          </span>
        </div>
      </div>

      {/* 3 PREÇOS SUGERIDOS EM CARTÕES DESTACADOS NO TOPO */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-muted flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-vinted-400" />
            Sugestões de Preço na Vinted
          </h3>
          <span className="text-[10px] text-dark-muted">Toca para selecionar</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* 1. Venda Rápida */}
          <button
            type="button"
            onClick={() => setSelectedPriceForSave(result.precos.venda_rapida.valor)}
            className={`border rounded-2xl p-2.5 flex flex-col justify-between text-left transition-all active:scale-95 ${
              selectedPriceForSave === result.precos.venda_rapida.valor
                ? "bg-amber-950/30 border-amber-400 ring-1 ring-amber-400"
                : "bg-dark-card border-amber-500/30"
            }`}
          >
            <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 shrink-0" />
              <span>Venda Rápida</span>
            </div>
            <div className="my-1">
              <span className="text-2xl font-black text-amber-300 font-mono">
                {result.precos.venda_rapida.valor}
              </span>
              <span className="text-sm font-bold text-amber-400 ml-0.5">€</span>
            </div>
            <p className="text-[9px] text-dark-muted leading-tight mt-1 line-clamp-2">
              24-48 horas
            </p>
          </button>

          {/* 2. Preço Justo (Recomendado) */}
          <button
            type="button"
            onClick={() => setSelectedPriceForSave(result.precos.preco_justo.valor)}
            className={`border-2 rounded-2xl p-2.5 flex flex-col justify-between text-left transition-all active:scale-95 relative ${
              selectedPriceForSave === result.precos.preco_justo.valor
                ? "bg-vinted-500/25 border-vinted-400 shadow-teal-glow ring-1 ring-vinted-400"
                : "bg-vinted-500/15 border-vinted-500/60"
            }`}
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-vinted-500 text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full tracking-wider shadow">
              Ideal
            </div>
            <div className="text-[10px] font-bold text-vinted-300 flex items-center gap-1 mb-1">
              <Target className="w-3 h-3 shrink-0" />
              <span>Preço Justo</span>
            </div>
            <div className="my-1">
              <span className="text-2xl font-black text-white font-mono">
                {result.precos.preco_justo.valor}
              </span>
              <span className="text-sm font-bold text-vinted-400 ml-0.5">€</span>
            </div>
            <p className="text-[9px] text-vinted-200/80 leading-tight mt-1 line-clamp-2">
              Melhor lucro
            </p>
          </button>

          {/* 3. Margem p/ Negociação */}
          <button
            type="button"
            onClick={() => setSelectedPriceForSave(result.precos.com_margem.valor)}
            className={`border rounded-2xl p-2.5 flex flex-col justify-between text-left transition-all active:scale-95 ${
              selectedPriceForSave === result.precos.com_margem.valor
                ? "bg-purple-950/30 border-purple-400 ring-1 ring-purple-400"
                : "bg-dark-card border-purple-500/30"
            }`}
          >
            <div className="text-[10px] font-bold text-purple-400 flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span>C/ Margem</span>
            </div>
            <div className="my-1">
              <span className="text-2xl font-black text-purple-300 font-mono">
                {result.precos.com_margem.valor}
              </span>
              <span className="text-sm font-bold text-purple-400 ml-0.5">€</span>
            </div>
            <p className="text-[9px] text-dark-muted leading-tight mt-1 line-clamp-2">
              Aceitar ofertas
            </p>
          </button>
        </div>

        {/* Save to Inventory Fast Action */}
        {onSaveToInventory && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={handleSaveInventory}
              disabled={savedLocally}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${
                savedLocally
                  ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300 cursor-default"
                  : "bg-dark-card hover:bg-dark-cardHover border-vinted-500/40 text-vinted-300 hover:text-white"
              }`}
            >
              {savedLocally ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span>Guardado na Lista &quot;À Venda&quot; ({selectedPriceForSave}€) ✓</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 text-vinted-400" />
                  <span>Guardar em &quot;Meus Artigos & Lucro&quot; por {selectedPriceForSave}€</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* CAIXA 1: TÍTULO COM BOTÃO DE COPIAR COM 1 TOQUE */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-2 relative shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-dark-muted flex items-center gap-1.5">
            Título Otimizado Vinted
          </label>
          <span className="text-[10px] text-dark-muted font-mono">
            {result.titulo_pt.length} carateres
          </span>
        </div>

        <div
          data-selectable="true"
          className="bg-dark-surface border border-dark-border/80 rounded-xl p-3 text-sm font-bold text-white leading-snug"
        >
          {result.titulo_pt}
        </div>

        <button
          type="button"
          onClick={() => copyToClipboard(result.titulo_pt, "titulo")}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            copiedSection === "titulo"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
              : "bg-vinted-500 hover:bg-vinted-600 text-white shadow-teal-glow"
          }`}
        >
          {copiedSection === "titulo" ? (
            <>
              <Check className="w-4 h-4 stroke-[3px]" />
              <span>Título Copiado! Pronto a Colar</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Título (1 Toque)</span>
            </>
          )}
        </button>
      </div>

      {/* CAIXA 2: DESCRIÇÃO COMPLETA COM BOTÃO DE COPIAR COM 1 TOQUE */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-2.5 relative shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-dark-muted flex items-center gap-1.5">
              Descrição Completa (PT + ES + FR + Tags)
            </label>
            <p className="text-[10px] text-vinted-400 mt-0.5">
              Pronta com tradução para compradores de Espanha e França
            </p>
          </div>
        </div>

        <div
          data-selectable="true"
          className="bg-dark-surface border border-dark-border/80 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans max-h-72 overflow-y-auto whitespace-pre-line space-y-2 select-text"
        >
          <div className="text-white">{result.descricao_pt}</div>
          <div className="pt-2 border-t border-dark-border/60 text-slate-300">
            {result.traducao_es_fr}
          </div>
          <div className="pt-2 border-t border-dark-border/60 text-vinted-300 font-mono text-[11px] break-words">
            {result.hashtags.join(" ")}
          </div>
        </div>

        <button
          type="button"
          onClick={() => copyToClipboard(fullListingText, "full_description")}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            copiedSection === "full_description"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
              : "bg-vinted-500 hover:bg-vinted-600 text-white shadow-teal-glow"
          }`}
        >
          {copiedSection === "full_description" ? (
            <>
              <Check className="w-4 h-4 stroke-[3px]" />
              <span>Descrição Completa Copiada! Pronto a Colar</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Descrição Completa (1 Toque)</span>
            </>
          )}
        </button>

        {/* Granular copy options */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => copyToClipboard(result.descricao_pt, "pt_only")}
            className="py-2 px-2.5 rounded-lg bg-dark-surface hover:bg-dark-cardHover border border-dark-border text-[11px] font-medium text-slate-300 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            {copiedSection === "pt_only" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-dark-muted" />
            )}
            <span>Copiar Só Português</span>
          </button>

          <button
            type="button"
            onClick={() => copyToClipboard(result.hashtags.join(" "), "tags_only")}
            className="py-2 px-2.5 rounded-lg bg-dark-surface hover:bg-dark-cardHover border border-dark-border text-[11px] font-medium text-slate-300 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            {copiedSection === "tags_only" ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-dark-muted" />
            )}
            <span>Copiar Só Hashtags</span>
          </button>
        </div>
      </div>

      {/* QUICK WORKFLOW SHORTCUTS */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={openVintedApp}
          className="py-3 px-3 rounded-2xl bg-vinted-500 hover:bg-vinted-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-teal-glow active:scale-95 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Abrir App Vinted</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="py-3 px-3 rounded-2xl bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4 text-dark-muted" />
          <span>Novo Artigo</span>
        </button>
      </div>
    </div>
  );
}

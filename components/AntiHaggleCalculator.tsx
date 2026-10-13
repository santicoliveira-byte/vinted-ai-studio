"use client";

import React, { useState, useEffect } from "react";
import { Shield, Sparkles, TrendingUp, Info, ArrowRight } from "lucide-react";

interface AntiHaggleCalculatorProps {
  targetNetPrice?: number;
  onTargetNetPriceChange: (val: number | undefined) => void;
  onSuggestedListPriceChange?: (val: number | undefined) => void;
}

export function AntiHaggleCalculator({
  targetNetPrice,
  onTargetNetPriceChange,
  onSuggestedListPriceChange,
}: AntiHaggleCalculatorProps) {
  const [inputValue, setInputValue] = useState<string>(
    targetNetPrice ? String(targetNetPrice) : ""
  );

  const numVal = parseFloat(inputValue);
  const isValid = !isNaN(numVal) && numVal > 0;

  // Typical discount offer by Vinted buyers is 15% to 20%
  // To get X net after 20% discount: List = X / 0.80
  // To get X net after 15% discount: List = X / 0.85
  const idealPriceMin = isValid ? Math.ceil(numVal / 0.85) : 0;
  const idealPriceMax = isValid ? Math.ceil(numVal / 0.80) : 0;
  const recommendedList = idealPriceMax;

  useEffect(() => {
    if (isValid) {
      onTargetNetPriceChange(numVal);
      if (onSuggestedListPriceChange) {
        onSuggestedListPriceChange(recommendedList);
      }
    } else {
      onTargetNetPriceChange(undefined);
      if (onSuggestedListPriceChange) {
        onSuggestedListPriceChange(undefined);
      }
    }
  }, [numVal, isValid, recommendedList]);

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Preço Anti-Regateio
            </h3>
            <p className="text-[10px] text-dark-muted">
              Proteção para absorver ofertas de -15% a -20%
            </p>
          </div>
        </div>
        {isValid && (
          <span className="bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
            Margem Ativa
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 items-end">
        {/* Input: Desired Net Amount */}
        <div>
          <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
            Quero Receber Limpo (€)
          </label>
          <div className="relative">
            <input
              type="number"
              step="1"
              placeholder="Ex: 15"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm font-bold text-white font-mono focus:border-amber-400 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
              €
            </span>
          </div>
        </div>

        {/* Output: Recommended List Price */}
        <div className="bg-gradient-to-br from-amber-950/30 to-dark-surface border border-amber-500/30 rounded-xl p-2.5">
          <div className="text-[9px] text-amber-300 font-bold uppercase tracking-wider">
            Publicar na Vinted a
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white font-mono">
              {isValid ? `${idealPriceMin}€ - ${idealPriceMax}€` : "— €"}
            </span>
          </div>
        </div>
      </div>

      {/* Real-world Negotiation Simulation */}
      {isValid && (
        <div className="bg-dark-surface/70 border border-dark-border/60 rounded-xl p-2.5 text-[10px] text-dark-muted space-y-1 animate-in fade-in">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>Se listares a {idealPriceMax}€:</span>
            <span className="text-emerald-400 font-mono">Meta de {numVal}€ protegida</span>
          </div>
          <div className="flex items-center justify-between text-dark-muted pt-0.5">
            <span>• Oferta de -15% do comprador:</span>
            <span className="text-white font-mono font-bold">
              {(idealPriceMax * 0.85).toFixed(1)}€ recebidos
            </span>
          </div>
          <div className="flex items-center justify-between text-dark-muted">
            <span>• Oferta agressiva de -20%:</span>
            <span className="text-white font-mono font-bold">
              {(idealPriceMax * 0.8).toFixed(1)}€ recebidos
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

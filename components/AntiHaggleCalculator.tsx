"use client";

import React, { useState, useEffect } from "react";
import { Shield, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";

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

  // Rule: Add +20% to +25% margin to absorb Vinted buyer discount offers
  // e.g. 15€ + 25% = 18.75€ -> 19€
  // Or 15 / 0.80 = 18.75€ -> 19€
  const pricePlus20 = isValid ? Math.ceil(numVal * 1.2) : 0;
  const pricePlus25 = isValid ? Math.ceil(numVal * 1.25) : 0;
  const idealListPrice = pricePlus25; // 19€ for 15€

  useEffect(() => {
    if (isValid) {
      onTargetNetPriceChange(numVal);
      if (onSuggestedListPriceChange) {
        onSuggestedListPriceChange(idealListPrice);
      }
    } else {
      onTargetNetPriceChange(undefined);
      if (onSuggestedListPriceChange) {
        onSuggestedListPriceChange(undefined);
      }
    }
  }, [numVal, isValid, idealListPrice]);

  return (
    <div className="bg-dark-card border border-vinted-500/30 rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Calculadora Anti-Regateio
            </h3>
            <p className="text-[10px] text-dark-muted">
              Margem de +20% a +25% para aceitar ofertas sem perder dinheiro
            </p>
          </div>
        </div>
        {isValid && (
          <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Protegido
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 items-end">
        {/* Input: Quanto queres ganhar limpo? (€) */}
        <div>
          <label className="text-[10px] text-slate-300 uppercase font-bold block mb-1">
            Quanto queres ganhar limpo? (€)
          </label>
          <div className="relative">
            <input
              type="number"
              step="1"
              placeholder="Ex: 15"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm font-bold text-white font-mono focus:border-vinted-500 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-vinted-400">
              €
            </span>
          </div>
        </div>

        {/* Output: Preço Ideal de Publicação */}
        <div className="bg-gradient-to-br from-[#0c2226] to-dark-surface border border-vinted-500/40 rounded-xl p-2.5">
          <div className="text-[9px] text-vinted-300 font-bold uppercase tracking-wider">
            Preço Ideal de Publicação
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-white font-mono">
              {isValid ? `${idealListPrice}€` : "— €"}
            </span>
            {isValid && (
              <span className="text-[10px] text-vinted-400 font-semibold ml-1">
                (+25%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Note */}
      {isValid && (
        <div className="bg-dark-surface/70 border border-dark-border/60 rounded-xl p-2.5 text-[10px] text-dark-muted space-y-1 animate-in fade-in">
          <div className="flex items-center justify-between text-slate-200 font-semibold">
            <span>Listando a {idealListPrice}€:</span>
            <span className="text-emerald-400 font-mono font-bold">
              Recebes {numVal}€ limpos garantidos!
            </span>
          </div>
          <p className="text-[9.5px] leading-tight text-slate-400 pt-0.5">
            💡 Podes aceitar qualquer proposta de desconto de até <strong>20%</strong> (comprador oferece {(idealListPrice * 0.8).toFixed(1)}€) e ficas exatamente com o valor desejado.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import {
  Shirt,
  Gamepad2,
  Cpu,
  Footprints,
  Watch,
  Package,
  Ruler,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ClothingDetails, TechDetails } from "@/types";

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  clothingDetails: ClothingDetails;
  onClothingDetailsChange: (details: ClothingDetails) => void;
  techDetails: TechDetails;
  onTechDetailsChange: (details: TechDetails) => void;
}

const CATEGORIES = [
  {
    id: "Streetwear & Roupa",
    label: "Streetwear / Roupa",
    subtitle: "Casacos, t-shirts, calças",
    icon: Shirt,
  },
  {
    id: "Videojogos & Consolas",
    label: "Gaming / Consolas",
    subtitle: "PS5, Switch, Retro, Jogos",
    icon: Gamepad2,
  },
  {
    id: "Hardware PC & Tech",
    label: "Hardware PC & Tech",
    subtitle: "GPUs, telemóveis, gadgets",
    icon: Cpu,
  },
  {
    id: "Calçado & Sapatilhas",
    label: "Calçado / Sapatilhas",
    subtitle: "Sneakers, botas, sapatos",
    icon: Footprints,
  },
  {
    id: "Acessórios & Malas",
    label: "Acessórios & Malas",
    subtitle: "Bonés, relógios, carteiras",
    icon: Watch,
  },
  {
    id: "Outros & Colecionáveis",
    label: "Outros / Colecionáveis",
    subtitle: "Figuras, LEGO, vintage",
    icon: Package,
  },
];

const FIT_OPTIONS = ["Oversized", "Boxy Fit", "Regular Fit", "Slim Fit"];

export function CategorySelector({
  selectedCategory,
  onSelectCategory,
  clothingDetails,
  onClothingDetailsChange,
  techDetails,
  onTechDetailsChange,
}: CategorySelectorProps) {
  const isClothing = selectedCategory === "Streetwear & Roupa";
  const isTech =
    selectedCategory === "Videojogos & Consolas" ||
    selectedCategory === "Hardware PC & Tech";

  const toggleFit = (fit: string) => {
    onClothingDetailsChange({
      ...clothingDetails,
      fit: clothingDetails.fit === fit ? undefined : fit,
    });
  };

  const updateMeasurements = (field: "widthPitToPit" | "lengthCm", val: string) => {
    onClothingDetailsChange({
      ...clothingDetails,
      [field]: val,
    });
  };

  const toggleTech = (field: keyof TechDetails) => {
    onTechDetailsChange({
      ...techDetails,
      [field]: !techDetails[field],
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-dark-muted">
          Categoria / Estilo
        </label>
        <span className="text-[11px] text-vinted-400 font-medium">
          {selectedCategory || "Seleciona uma"}
        </span>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                isSelected
                  ? "bg-vinted-500/15 border-vinted-500 text-white shadow-teal-glow"
                  : "bg-dark-card border-dark-border/80 hover:border-dark-border text-slate-300 hover:text-white"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "bg-vinted-500 text-white"
                    : "bg-dark-surface text-dark-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={`text-xs font-semibold truncate ${
                    isSelected ? "text-vinted-300" : "text-slate-200"
                  }`}
                >
                  {cat.label}
                </div>
                <div className="text-[10px] text-dark-muted truncate mt-0.5">
                  {cat.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC FIELD 1: ROUPA / STREETWEAR (FIT + MEDIDAS) */}
      {isClothing && (
        <div className="bg-dark-card border border-vinted-500/30 rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-vinted-400" />
              <span>Fit & Medidas em cm (Opcional)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              Gera em PT, ES e FR
            </span>
          </div>

          {/* Quick Fit Chips */}
          <div>
            <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1.5">
              Tipo de Corte / Fit
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FIT_OPTIONS.map((fit) => {
                const isActive = clothingDetails.fit === fit;
                return (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => toggleFit(fit)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                      isActive
                        ? "bg-vinted-500 text-white shadow-teal-glow"
                        : "bg-dark-surface border border-dark-border text-slate-300 hover:text-white"
                    }`}
                  >
                    {fit}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 Measurement Inputs (cm) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                Axila a Axila (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Ex: 56"
                  value={clothingDetails.widthPitToPit || ""}
                  onChange={(e) => updateMeasurements("widthPitToPit", e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-dark-muted/50 focus:border-vinted-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-dark-muted">
                  cm
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                Comprimento (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Ex: 72"
                  value={clothingDetails.lengthCm || ""}
                  onChange={(e) => updateMeasurements("lengthCm", e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-dark-muted/50 focus:border-vinted-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-dark-muted">
                  cm
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-dark-muted leading-tight">
            💡 <strong>Dica Vinted:</strong> Artigos com medidas vendem 3x mais rápido e evitam que compradores peçam fotos com fita métrica!
          </p>
        </div>
      )}

      {/* DYNAMIC FIELD 2: GAMING & HARDWARE (GARANTIAS DE FUNCIONAMENTO) */}
      {isTech && (
        <div className="bg-dark-card border border-vinted-500/30 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantias de Funcionamento & Envio</span>
            </span>
            <span className="text-[10px] text-vinted-400 font-medium">
              Incluído no anúncio
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => toggleTech("testedAndWorking")}
              className={`p-2 rounded-xl border text-left text-[11px] font-semibold flex items-center gap-2 transition-all active:scale-95 ${
                techDetails.testedAndWorking
                  ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                  : "bg-dark-surface border-dark-border text-dark-muted"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  techDetails.testedAndWorking ? "text-emerald-400" : "text-dark-muted"
                }`}
              />
              <span className="leading-tight">100% testado e funcional</span>
            </button>

            <button
              type="button"
              onClick={() => toggleTech("pristineCondition")}
              className={`p-2 rounded-xl border text-left text-[11px] font-semibold flex items-center gap-2 transition-all active:scale-95 ${
                techDetails.pristineCondition
                  ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                  : "bg-dark-surface border-dark-border text-dark-muted"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  techDetails.pristineCondition ? "text-emerald-400" : "text-dark-muted"
                }`}
              />
              <span className="leading-tight">Caixa / disco impecável</span>
            </button>

            <button
              type="button"
              onClick={() => toggleTech("bubbleWrapPackaging")}
              className={`p-2 rounded-xl border text-left text-[11px] font-semibold flex items-center gap-2 transition-all active:scale-95 ${
                techDetails.bubbleWrapPackaging
                  ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                  : "bg-dark-surface border-dark-border text-dark-muted"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  techDetails.bubbleWrapPackaging ? "text-emerald-400" : "text-dark-muted"
                }`}
              />
              <span className="leading-tight">Envio c/ plástico bolha</span>
            </button>

            <button
              type="button"
              onClick={() => toggleTech("accessoriesIncluded")}
              className={`p-2 rounded-xl border text-left text-[11px] font-semibold flex items-center gap-2 transition-all active:scale-95 ${
                techDetails.accessoriesIncluded
                  ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                  : "bg-dark-surface border-dark-border text-dark-muted"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  techDetails.accessoriesIncluded ? "text-emerald-400" : "text-dark-muted"
                }`}
              />
              <span className="leading-tight">Cabos / manuais incluídos</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

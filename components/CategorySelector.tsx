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
import { ClothingDetails, TechDetails, FootwearDetails } from "@/types";

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  clothingDetails: ClothingDetails;
  onClothingDetailsChange: (details: ClothingDetails) => void;
  techDetails: TechDetails;
  onTechDetailsChange: (details: TechDetails) => void;
  footwearDetails: FootwearDetails;
  onFootwearDetailsChange: (details: FootwearDetails) => void;
}

const CATEGORIES = [
  {
    id: "Roupa / Streetwear",
    label: "Roupa / Streetwear",
    subtitle: "Casacos, hoodies, t-shirts, calças",
    icon: Shirt,
  },
  {
    id: "Videojogos",
    label: "Videojogos",
    subtitle: "PS5, Switch, Retro, Jogos",
    icon: Gamepad2,
  },
  {
    id: "Hardware / Tech",
    label: "Hardware / Tech",
    subtitle: "GPUs, telemóveis, gadgets, áudio",
    icon: Cpu,
  },
  {
    id: "Calçado / Acessórios",
    label: "Calçado / Acessórios",
    subtitle: "Sneakers, botas, relógios, malas",
    icon: Footprints,
  },
  {
    id: "Outros / Colecionáveis",
    label: "Outros / Colecionáveis",
    subtitle: "Figuras, LEGO, memorabilia",
    icon: Package,
  },
];

const FIT_OPTIONS = ["Oversized", "Boxy Fit", "Regular", "Slim"];
const SHOE_SIZES_PRESET = ["39", "40", "41", "42", "43", "44", "45"];

export function CategorySelector({
  selectedCategory,
  onSelectCategory,
  clothingDetails,
  onClothingDetailsChange,
  techDetails,
  onTechDetailsChange,
  footwearDetails,
  onFootwearDetailsChange,
}: CategorySelectorProps) {
  const isClothing =
    selectedCategory === "Roupa / Streetwear" ||
    selectedCategory.toLowerCase().includes("roupa");

  const isTech =
    selectedCategory === "Videojogos" ||
    selectedCategory === "Hardware / Tech" ||
    selectedCategory.toLowerCase().includes("tech") ||
    selectedCategory.toLowerCase().includes("jogos");

  const isFootwear =
    selectedCategory === "Calçado / Acessórios" ||
    selectedCategory.toLowerCase().includes("calçado") ||
    selectedCategory.toLowerCase().includes("sapatilhas");

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

      {/* 1. CAMPOS DINÂMICOS: ROUPA / STREETWEAR */}
      {isClothing && (
        <div className="bg-dark-card border border-vinted-500/35 rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-vinted-400" />
              <span>Fit & Medidas (Roupa / Streetwear)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">
              Formatado em PT, ES e FR
            </span>
          </div>

          {/* Chips de Fit Rápido */}
          <div>
            <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1.5">
              Corte / Fit:
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

          {/* 2 Campos Numéricos Lado a Lado */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                Largura Axila-Axila (cm)
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
            💡 <strong>Vantagem Vinted:</strong> Artigos com medidas axila-axila vendem 3x mais rápido e evitam devoluções por tamanho errado.
          </p>
        </div>
      )}

      {/* 2. CAMPOS DINÂMICOS: VIDEOJOGOS OU HARDWARE / TECH */}
      {isTech && (
        <div className="bg-dark-card border border-vinted-500/35 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantias & Estado (Gaming / Tech)</span>
            </span>
            <span className="text-[10px] text-vinted-400 font-medium">
              Gera confiança
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => toggleTech("testedAndWorking")}
              className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold flex items-center gap-2 transition-all active:scale-95 ${
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
              <span className="leading-tight">100% Testado e Funcional</span>
            </button>

            <button
              type="button"
              onClick={() => toggleTech("pristineCondition")}
              className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold flex items-center gap-2 transition-all active:scale-95 ${
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
              <span className="leading-tight">Com Caixa Original</span>
            </button>

            <button
              type="button"
              onClick={() => toggleTech("accessoriesIncluded")}
              className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold flex items-center gap-2 transition-all active:scale-95 ${
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
              <span className="leading-tight">Sem Riscos / Impecável</span>
            </button>

            <button
              type="button"
              onClick={() => toggleTech("bubbleWrapPackaging")}
              className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold flex items-center gap-2 transition-all active:scale-95 ${
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
              <span className="leading-tight">Envio c/ Plástico Bolha</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. CAMPOS DINÂMICOS: CALÇADO / ACESSÓRIOS */}
      {isFootwear && (
        <div className="bg-dark-card border border-vinted-500/35 rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-vinted-400" />
              <span>Especificações de Calçado / Ténis</span>
            </span>
            <span className="text-[10px] text-vinted-400 font-medium">
              Tamanho & Autenticidade
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-dark-muted uppercase font-bold">
                Tamanho (EU)
              </label>
              <span className="text-[10px] text-slate-300 font-mono">
                {footwearDetails.sizeEu ? `EU ${footwearDetails.sizeEu}` : "Escolhe ou escreve"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {SHOE_SIZES_PRESET.map((sz) => {
                const isSelected = footwearDetails.sizeEu === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() =>
                      onFootwearDetailsChange({
                        ...footwearDetails,
                        sizeEu: isSelected ? undefined : sz,
                      })
                    }
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all ${
                      isSelected
                        ? "bg-vinted-500 text-white shadow-teal-glow"
                        : "bg-dark-surface border border-dark-border text-slate-300"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}

              <input
                type="text"
                placeholder="Outro"
                value={
                  SHOE_SIZES_PRESET.includes(footwearDetails.sizeEu || "")
                    ? ""
                    : footwearDetails.sizeEu || ""
                }
                onChange={(e) =>
                  onFootwearDetailsChange({
                    ...footwearDetails,
                    sizeEu: e.target.value,
                  })
                }
                className="w-16 shrink-0 bg-dark-surface border border-dark-border rounded-xl px-2 py-1 text-xs font-mono font-bold text-white placeholder:text-dark-muted/60 text-center focus:border-vinted-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Checkbox 100% Original / Autenticado */}
          <button
            type="button"
            onClick={() =>
              onFootwearDetailsChange({
                ...footwearDetails,
                authenticatedOriginal: !footwearDetails.authenticatedOriginal,
              })
            }
            className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all active:scale-[0.99] ${
              footwearDetails.authenticatedOriginal
                ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                : "bg-dark-surface border-dark-border text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${
                  footwearDetails.authenticatedOriginal
                    ? "text-emerald-400"
                    : "text-dark-muted"
                }`}
              />
              <span>100% Original / Autenticado</span>
            </div>
            <span className="text-[10px] text-dark-muted font-normal">
              Garantia de origem
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

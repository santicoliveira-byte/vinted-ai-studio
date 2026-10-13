"use client";

import { Shirt, Gamepad2, Cpu, Footprints, Watch, Package } from "lucide-react";

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  {
    id: "Streetwear & Roupa",
    label: "Streetwear / Roupa",
    subtitle: "Casacos, t-shirts, calças",
    icon: Shirt,
  },
  {
    id: "Calçado & Sapatilhas",
    label: "Calçado / Sapatilhas",
    subtitle: "Sneakers, botas, sapatos",
    icon: Footprints,
  },
  {
    id: "Videojogos & Consolas",
    label: "Videojogos & Gaming",
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

export function CategorySelector({
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-dark-muted">
          Categoria / Estilo
        </label>
        <span className="text-[11px] text-vinted-400 font-medium">
          {selectedCategory || "Seleciona uma"}
        </span>
      </div>

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
    </div>
  );
}

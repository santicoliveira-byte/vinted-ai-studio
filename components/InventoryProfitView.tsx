"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  DollarSign,
  Tag,
  ExternalLink,
  Edit3,
  BarChart3,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  X,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { InventoryItem, GeminiListingResult } from "@/types";

interface InventoryProfitViewProps {
  items: InventoryItem[];
  onUpdateItems: (items: InventoryItem[]) => void;
  onOpenListing: (result: GeminiListingResult) => void;
}

export function InventoryProfitView({
  items,
  onUpdateItems,
  onOpenListing,
}: InventoryProfitViewProps) {
  const [filter, setFilter] = useState<"all" | "active" | "sold">("all");

  // Modal: Mark as sold
  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [finalSalePrice, setFinalSalePrice] = useState<string>("");
  const [costPrice, setCostPrice] = useState<string>("");

  // Modal: Add item manually
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualCategory, setManualCategory] = useState("Streetwear & Roupa");

  // Calculations
  const soldItems = items.filter((i) => i.status === "sold");
  const activeItems = items.filter((i) => i.status === "active");

  const totalEarned = soldItems.reduce((acc, curr) => acc + (curr.precoVenda || 0), 0);
  const totalCostSold = soldItems.reduce((acc, curr) => acc + (curr.precoCusto || 0), 0);
  const netProfit = totalEarned - totalCostSold;

  const potentialStockValue = activeItems.reduce(
    (acc, curr) => acc + (curr.precoListado || 0),
    0
  );

  // Category breakdown for chart
  const categoryStats: Record<string, { total: number; count: number }> = {};
  soldItems.forEach((i) => {
    const cat = i.category || "Outros";
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, count: 0 };
    categoryStats[cat].total += i.precoVenda || 0;
    categoryStats[cat].count += 1;
  });

  // Action: Open Mark Sold Modal
  const openSellModal = (item: InventoryItem) => {
    setSellingItem(item);
    setFinalSalePrice(String(item.precoListado || ""));
    setCostPrice(item.precoCusto ? String(item.precoCusto) : "");
  };

  // Action: Confirm Sale
  const handleConfirmSale = () => {
    if (!sellingItem) return;
    const saleNum = parseFloat(finalSalePrice) || sellingItem.precoListado || 0;
    const costNum = parseFloat(costPrice) || 0;

    const updated = items.map((i) => {
      if (i.id === sellingItem.id) {
        return {
          ...i,
          status: "sold" as const,
          precoVenda: saleNum,
          precoCusto: costNum,
          soldAt: new Date().toISOString(),
        };
      }
      return i;
    });

    onUpdateItems(updated);
    setSellingItem(null);

    // Confetti celebration
    try {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#00a8b5", "#007782", "#ffffff"],
      });
    } catch {
      // ignore
    }
  };

  // Action: Reopen Sold item
  const handleReopenItem = (id: string) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          status: "active" as const,
          precoVenda: undefined,
          soldAt: undefined,
        };
      }
      return i;
    });
    onUpdateItems(updated);
  };

  // Action: Delete item
  const handleDeleteItem = (id: string) => {
    if (confirm("Tens a certeza que queres remover este artigo?")) {
      const updated = items.filter((i) => i.id !== id);
      onUpdateItems(updated);
    }
  };

  // Action: Add Manual Item
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualPrice) return;

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
      titulo: manualTitle.trim(),
      category: manualCategory,
      status: "active",
      precoListado: parseFloat(manualPrice) || 0,
    };

    onUpdateItems([newItem, ...items]);
    setManualTitle("");
    setManualPrice("");
    setIsAddModalOpen(false);
  };

  const filteredItems = items.filter((i) => {
    if (filter === "active") return i.status === "active";
    if (filter === "sold") return i.status === "sold";
    return true;
  });

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-150">
      {/* PROFIT DASHBOARD CARD */}
      <div className="bg-gradient-to-br from-[#0a1f22] via-dark-card to-dark-surface border border-vinted-500/40 rounded-3xl p-4 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-vinted-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between text-xs text-vinted-300 font-semibold mb-1">
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Lucro Total na Vinted
          </span>
          <span className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {soldItems.length} vendas feitas
          </span>
        </div>

        {/* Big Profit Counter */}
        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {totalEarned.toFixed(2)}
            </span>
            <span className="text-xl font-bold text-emerald-400">€</span>
          </div>
          {totalCostSold > 0 && (
            <p className="text-[11px] text-emerald-300 font-medium mt-0.5">
              + {netProfit.toFixed(2)}€ de lucro limpo (descontando custo)
            </p>
          )}
        </div>

        {/* 2 Sub-metrics */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dark-border/60 mt-3">
          <div className="bg-dark-surface/60 border border-dark-border/60 rounded-xl p-2.5">
            <div className="text-[10px] text-dark-muted font-medium flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-vinted-400" />
              <span>Em Venda (Ativos)</span>
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {activeItems.length}{" "}
              <span className="text-[10px] text-dark-muted font-normal">artigos</span>
            </div>
          </div>

          <div className="bg-dark-surface/60 border border-dark-border/60 rounded-xl p-2.5">
            <div className="text-[10px] text-dark-muted font-medium flex items-center gap-1">
              <Tag className="w-3 h-3 text-amber-400" />
              <span>Valor Potencial Stock</span>
            </div>
            <div className="text-sm font-bold text-amber-300 mt-1 font-mono">
              {potentialStockValue.toFixed(0)}€
            </div>
          </div>
        </div>

        {/* Mini Visual Chart Bar: Sold vs Active */}
        {items.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-dark-border/60">
            <div className="flex items-center justify-between text-[10px] text-dark-muted mb-1.5">
              <span>Taxa de Venda ({items.length} total)</span>
              <span className="text-emerald-400 font-bold">
                {Math.round((soldItems.length / items.length) * 100)}% vendido
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-dark-surface overflow-hidden flex">
              <div
                style={{
                  width: `${(soldItems.length / items.length) * 100}%`,
                }}
                className="bg-emerald-500 h-full transition-all duration-500"
              />
              <div
                style={{
                  width: `${(activeItems.length / items.length) * 100}%`,
                }}
                className="bg-vinted-500/50 h-full transition-all duration-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* FILTER TABS & ADD BUTTON */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center bg-dark-card border border-dark-border rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-vinted-500 text-white shadow"
                : "text-dark-muted hover:text-white"
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "active"
                ? "bg-vinted-500 text-white shadow"
                : "text-dark-muted hover:text-white"
            }`}
          >
            À Venda ({activeItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("sold")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "sold"
                ? "bg-vinted-500 text-white shadow"
                : "text-dark-muted hover:text-white"
            }`}
          >
            Vendidos ({soldItems.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="p-2 rounded-xl bg-vinted-500 hover:bg-vinted-600 text-white shadow-teal-glow active:scale-95 transition-all flex items-center gap-1 text-xs font-bold shrink-0"
          title="Adicionar Artigo Manual"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </div>

      {/* ITEMS LIST */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center space-y-2 bg-dark-card border border-dark-border rounded-2xl p-4">
          <Package className="w-8 h-8 text-dark-muted mx-auto" />
          <h4 className="text-xs font-bold text-white">Nenhum artigo encontrado</h4>
          <p className="text-[11px] text-dark-muted max-w-xs mx-auto">
            Gera um anúncio e toca em &quot;Guardar nos Meus Artigos&quot; ou clica em &quot;+&quot; para adicionar manualmente.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const isSold = item.status === "sold";

            return (
              <div
                key={item.id}
                className={`bg-dark-card border rounded-2xl p-3 transition-all space-y-2.5 ${
                  isSold
                    ? "border-emerald-500/30 bg-[#0d1716]"
                    : "border-dark-border/90 hover:border-vinted-500/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt={item.titulo}
                      className="w-14 h-14 rounded-xl object-cover border border-dark-border shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center shrink-0 text-vinted-400 font-bold text-sm">
                      <Tag className="w-5 h-5 text-dark-muted" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-white truncate leading-snug">
                        {item.titulo}
                      </h4>
                      {isSold ? (
                        <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3px]" />
                          Vendido
                        </span>
                      ) : (
                        <span className="bg-vinted-500/20 border border-vinted-500/40 text-vinted-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0">
                          À Venda
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-dark-muted mt-0.5 truncate">
                      {item.category} • {new Date(item.createdAt).toLocaleDateString("pt-PT")}
                    </div>

                    {/* Price display */}
                    <div className="flex items-center gap-2 mt-1.5">
                      {isSold ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-dark-muted line-through">
                            {item.precoListado}€
                          </span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            {item.precoVenda}€
                          </span>
                          <span className="text-[10px] text-emerald-500 font-semibold">
                            (recebido)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-white font-mono">
                            {item.precoListado}€
                          </span>
                          <span className="text-[10px] text-vinted-400 font-medium">
                            listado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-2 border-t border-dark-border/60">
                  <div className="flex items-center gap-2">
                    {item.result && (
                      <button
                        type="button"
                        onClick={() => onOpenListing(item.result!)}
                        className="text-[10px] font-semibold text-vinted-400 hover:text-vinted-300 flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Ver Anúncio</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isSold ? (
                      <button
                        type="button"
                        onClick={() => openSellModal(item)}
                        className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Marcar Vendido</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReopenItem(item.id)}
                        className="py-1 px-2 rounded-lg bg-dark-surface border border-dark-border text-dark-muted hover:text-slate-200 text-[10px] transition-colors"
                      >
                        Voltar a À Venda
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Eliminar artigo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: MARCAR COMO VENDIDO */}
      {sellingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-dark-card border border-dark-border w-full max-w-sm rounded-3xl p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Confirmar Venda
                  </h3>
                  <p className="text-[10px] text-dark-muted truncate max-w-[200px]">
                    {sellingItem.titulo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSellingItem(null)}
                className="text-dark-muted hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                Valor Final de Venda (€)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={finalSalePrice}
                  onChange={(e) => setFinalSalePrice(e.target.value)}
                  className="w-full bg-dark-surface border border-emerald-500/50 rounded-xl px-3 py-2.5 text-base font-black text-white font-mono focus:outline-none"
                  placeholder="30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-emerald-400 font-bold">
                  €
                </span>
              </div>
              <p className="text-[10px] text-dark-muted mt-1">
                Valor que o comprador pagou pelo artigo (sem portes).
              </p>
            </div>

            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                Preço de Custo / Compra (€) — Opcional
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs font-bold text-white font-mono focus:outline-none"
                  placeholder="Ex: 10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dark-muted">
                  €
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSellingItem(null)}
                className="py-2.5 rounded-xl bg-dark-surface border border-dark-border text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSale}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
              >
                Confirmar Venda 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR ARTIGO MANUAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <form
            onSubmit={handleAddManualItem}
            className="bg-dark-card border border-dark-border w-full max-w-sm rounded-3xl p-4 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Adicionar Artigo Manual
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-dark-muted hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                Título do Artigo
              </label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Ex: Nike Dunk Low Panda 42"
                className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vinted-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                  Preço Listado (€)
                </label>
                <input
                  type="number"
                  required
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="35"
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-vinted-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                  Categoria
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-vinted-500"
                >
                  <option value="Streetwear & Roupa">Roupa</option>
                  <option value="Calçado & Sapatilhas">Calçado</option>
                  <option value="Videojogos & Consolas">Jogos</option>
                  <option value="Hardware PC & Tech">Tech</option>
                  <option value="Acessórios & Malas">Acessórios</option>
                  <option value="Outros & Colecionáveis">Outros</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="py-2.5 rounded-xl bg-dark-surface border border-dark-border text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2.5 rounded-xl bg-vinted-500 hover:bg-vinted-600 text-white text-xs font-bold shadow-teal-glow active:scale-95 transition-all"
              >
                Guardar Artigo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

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
  Sparkles,
  ShoppingBag,
  Truck,
  ArrowRight,
  X,
  Check,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Boxes,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { InventoryItem, InventoryStatus, GeminiListingResult } from "@/types";

interface InventoryProfitViewProps {
  items: InventoryItem[];
  onUpdateItems: (items: InventoryItem[]) => void;
  onOpenListing: (result: GeminiListingResult) => void;
}

type FilterTab = "active" | "shipping" | "sold" | "all";

export function InventoryProfitView({
  items,
  onUpdateItems,
  onOpenListing,
}: InventoryProfitViewProps) {
  // 3 Filtros principais de estado
  const [activeFilter, setActiveFilter] = useState<FilterTab>("active");

  // Modal: Registar Venda / Enviar
  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [salePriceInput, setSalePriceInput] = useState<string>("");
  const [costPriceInput, setCostPriceInput] = useState<string>("");
  const [courierInput, setCourierInput] = useState<string>("InPost / Cacifo");

  // Modal: Adicionar Artigo em 5 Segundos
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualCost, setManualCost] = useState("");
  const [manualCategory, setManualCategory] = useState("Roupa / Streetwear");
  const [manualStatus, setManualStatus] = useState<InventoryStatus>("active");

  // Cálculos financeiros
  const completedItems = items.filter((i) => i.status === "sold");
  const shippingItems = items.filter((i) => i.status === "shipping");
  const activeItems = items.filter((i) => i.status === "active");

  // Lucro Confirmado (€) - Apenas artigos entregues/concluídos
  const lucroConfirmado = completedItems.reduce(
    (acc, curr) => acc + (curr.precoVenda || curr.precoListado || 0),
    0
  );
  const custoConfirmado = completedItems.reduce(
    (acc, curr) => acc + (curr.precoCusto || 0),
    0
  );
  const lucroLimpo = lucroConfirmado - custoConfirmado;

  // Saldo Pendente em Trânsito (€) - Artigos vendidos a aguardar envio ou a caminho
  const saldoPendente = shippingItems.reduce(
    (acc, curr) => acc + (curr.precoVenda || curr.precoListado || 0),
    0
  );

  // Valor Potencial de Stock à venda
  const valorStockAtivo = activeItems.reduce(
    (acc, curr) => acc + (curr.precoListado || 0),
    0
  );

  // Filtragem dos artigos
  const filteredItems = items.filter((item) => {
    if (activeFilter === "all") return true;
    return item.status === activeFilter;
  });

  // Ação: Abrir modal de venda para um artigo ativo
  const openSellModal = (item: InventoryItem) => {
    setSellingItem(item);
    setSalePriceInput(String(item.precoListado || ""));
    setCostPriceInput(item.precoCusto ? String(item.precoCusto) : "");
    setCourierInput(item.courier || "InPost / Cacifo");
  };

  // Ação: Confirmar que o artigo foi vendido -> Passa para 'shipping' (Aguardar Envio / Em Trânsito)
  const handleConfirmToShipping = () => {
    if (!sellingItem) return;
    const saleNum = parseFloat(salePriceInput) || sellingItem.precoListado || 0;
    const costNum = parseFloat(costPriceInput) || 0;

    const updated = items.map((i) => {
      if (i.id === sellingItem.id) {
        return {
          ...i,
          status: "shipping" as const,
          precoVenda: saleNum,
          precoCusto: costNum,
          courier: courierInput,
          soldAt: new Date().toISOString(),
        };
      }
      return i;
    });

    onUpdateItems(updated);
    setSellingItem(null);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#00a8b5", "#38bdf8", "#ffffff"],
      });
    } catch {
      // ignore
    }
  };

  // Ação: Marcar como Concluído / Entregue -> Passa para 'sold' (soma ao Lucro Confirmado)
  const handleMarkAsCompleted = (id: string) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          status: "sold" as const,
          completedAt: new Date().toISOString(),
        };
      }
      return i;
    });

    onUpdateItems(updated);

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#007782", "#00a8b5", "#ffffff"],
      });
    } catch {
      // ignore
    }
  };

  // Ação: Reverter para "À Venda"
  const handleRevertToActive = (id: string) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          status: "active" as const,
          precoVenda: undefined,
          soldAt: undefined,
          completedAt: undefined,
        };
      }
      return i;
    });
    onUpdateItems(updated);
  };

  // Ação: Eliminar artigo
  const handleDeleteItem = (id: string) => {
    if (confirm("Tens a certeza que queres eliminar este artigo?")) {
      const updated = items.filter((i) => i.id !== id);
      onUpdateItems(updated);
    }
  };

  // Ação: Adicionar artigo manualmente em 5 segundos
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualPrice) return;

    const listPrice = parseFloat(manualPrice) || 0;
    const costPrice = manualCost ? parseFloat(manualCost) : undefined;

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
      titulo: manualTitle.trim(),
      category: manualCategory,
      status: manualStatus,
      precoListado: listPrice,
      precoVenda: manualStatus !== "active" ? listPrice : undefined,
      precoCusto: costPrice,
      soldAt: manualStatus !== "active" ? new Date().toISOString() : undefined,
      completedAt: manualStatus === "sold" ? new Date().toISOString() : undefined,
    };

    onUpdateItems([newItem, ...items]);
    setManualTitle("");
    setManualPrice("");
    setManualCost("");
    setIsAddModalOpen(false);

    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#007782", "#00a8b5", "#10b981"],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-150">
      {/* ============================================================== */}
      {/* 2 CARTÕES FINANCEIROS DESTACADOS NO TOPO                      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Cartão 1: Lucro Confirmado (€) */}
        <div className="bg-gradient-to-br from-[#07241c] via-dark-card to-dark-surface border border-emerald-500/40 rounded-3xl p-3.5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Lucro Confirmado</span>
              </span>
            </div>

            <div className="my-1">
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {lucroConfirmado.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-emerald-400">€</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-300/80 flex items-center justify-between">
            <span>{completedItems.length} entregues</span>
            {custoConfirmado > 0 && (
              <span className="text-emerald-400 font-mono font-semibold">
                +{lucroLimpo.toFixed(0)}€ líq.
              </span>
            )}
          </div>
        </div>

        {/* Cartão 2: Saldo Pendente em Trânsito (€) */}
        <div className="bg-gradient-to-br from-[#0c2229] via-dark-card to-dark-surface border border-cyan-500/40 rounded-3xl p-3.5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
                <span>Saldo Pendente</span>
              </span>
            </div>

            <div className="my-1">
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {saldoPendente.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-cyan-400">€</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-cyan-500/20 text-[10px] text-cyan-200/80 flex items-center justify-between">
            <span>{shippingItems.length} em trânsito</span>
            <span className="text-cyan-400 font-medium">aguarda entrega</span>
          </div>
        </div>
      </div>

      {/* Mini Resumo de Stock Ativo */}
      <div className="bg-dark-card/90 border border-dark-border rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-dark-muted text-[11px]">
          <ShoppingBag className="w-3.5 h-3.5 text-vinted-400" />
          <span>
            Stock Publicado: <strong className="text-white">{activeItems.length}</strong> artigos
          </span>
        </div>
        <div className="text-[11px] font-mono text-vinted-300 font-bold">
          {valorStockAtivo.toFixed(0)}€ potencial
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3 FILTROS DE ESTADO + BOTÃO ADICIONAR EM 5 SEGUNDOS            */}
      {/* ============================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1.5">
          {/* Seletor de 3 Filtros */}
          <div className="grid grid-cols-3 gap-1 bg-dark-card border border-dark-border p-1 rounded-2xl flex-1">
            {/* Filtro 1: À Venda */}
            <button
              type="button"
              onClick={() => setActiveFilter("active")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                activeFilter === "active"
                  ? "bg-vinted-500 text-white shadow-teal-glow ring-1 ring-vinted-400/40"
                  : "text-dark-muted hover:text-white"
              }`}
            >
              <span>À Venda</span>
              <span className="text-[9px] opacity-80 font-mono">({activeItems.length})</span>
            </button>

            {/* Filtro 2: Aguardar Envio / Em Trânsito */}
            <button
              type="button"
              onClick={() => setActiveFilter("shipping")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                activeFilter === "shipping"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/40"
                  : "text-dark-muted hover:text-white"
              }`}
            >
              <span>Em Trânsito</span>
              <span className="text-[9px] opacity-80 font-mono">({shippingItems.length})</span>
            </button>

            {/* Filtro 3: Concluídos */}
            <button
              type="button"
              onClick={() => setActiveFilter("sold")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                activeFilter === "sold"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400/40"
                  : "text-dark-muted hover:text-white"
              }`}
            >
              <span>Concluídos</span>
              <span className="text-[9px] opacity-80 font-mono">({completedItems.length})</span>
            </button>
          </div>

          {/* Botão de Adicionar Manual em 5s */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-vinted-500 to-vinted-accent hover:brightness-110 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-teal-glow active:scale-95 transition-all shrink-0"
            title="Adicionar Artigo em 5s"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span className="hidden xs:inline">Novo</span>
          </button>
        </div>

        {/* Toggle para ver Todos */}
        {activeFilter === "all" && (
          <div className="flex items-center justify-between px-1 text-[11px] text-dark-muted">
            <span>A mostrar todos os artigos ({items.length})</span>
            <button
              type="button"
              onClick={() => setActiveFilter("active")}
              className="text-vinted-400 underline font-semibold"
            >
              Filtrar por estado
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* LISTA DE ARTIGOS CONFORME O FILTRO SELECIONADO                 */}
      {/* ============================================================== */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center space-y-2.5 bg-dark-card border border-dark-border rounded-3xl p-6">
          <div className="w-12 h-12 rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-center mx-auto text-dark-muted">
            {activeFilter === "active" && <ShoppingBag className="w-6 h-6 text-vinted-400" />}
            {activeFilter === "shipping" && <Truck className="w-6 h-6 text-cyan-400" />}
            {activeFilter === "sold" && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
            {activeFilter === "all" && <Package className="w-6 h-6 text-dark-muted" />}
          </div>
          <h4 className="text-xs font-bold text-white">
            {activeFilter === "active" && "Nenhum artigo à venda neste momento"}
            {activeFilter === "shipping" && "Nenhum artigo a aguardar envio ou em trânsito"}
            {activeFilter === "sold" && "Ainda não tens encomendas concluídas"}
            {activeFilter === "all" && "Inventário vazio"}
          </h4>
          <p className="text-[11px] text-dark-muted max-w-xs mx-auto leading-relaxed">
            {activeFilter === "active" &&
              "Gera um anúncio na aba 'Criar' ou toca em '+ Novo' para adicionar um artigo em 5 segundos."}
            {activeFilter === "shipping" &&
              "Quando venderes um artigo da lista 'À Venda', toca em 'Registar Venda' para colocá-lo aqui."}
            {activeFilter === "sold" &&
              "Quando o comprador confirmar a receção da encomenda na Vinted, toca em 'Concluir' para somar ao teu lucro!"}
            {activeFilter === "all" &&
              "Adiciona artigos para gerir o teu stock e ver o saldo em tempo real."}
          </p>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-vinted-500/20 border border-vinted-500/50 text-vinted-300 text-xs font-bold hover:bg-vinted-500/30 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Artigo em 5s</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isShipping = item.status === "shipping";
            const isSold = item.status === "sold";
            const isActive = item.status === "active";

            return (
              <div
                key={item.id}
                className={`border rounded-3xl p-3.5 transition-all space-y-3 shadow-lg ${
                  isActive
                    ? "bg-dark-card border-dark-border hover:border-vinted-500/40"
                    : isShipping
                    ? "bg-gradient-to-br from-[#071d22] to-dark-card border-cyan-500/40 shadow-cyan-950/20"
                    : "bg-gradient-to-br from-[#061e17] to-dark-card border-emerald-500/40 shadow-emerald-950/20"
                }`}
              >
                {/* Header do Cartão do Artigo */}
                <div className="flex items-start gap-3">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt={item.titulo}
                      className="w-16 h-16 rounded-2xl object-cover border border-dark-border shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-center shrink-0 text-vinted-400 font-bold">
                      <Tag className="w-6 h-6 text-dark-muted" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-white truncate leading-snug">
                        {item.titulo}
                      </h4>

                      {/* Badge de Estado */}
                      {isActive && (
                        <span className="bg-vinted-500/20 border border-vinted-500/40 text-vinted-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
                          À Venda
                        </span>
                      )}
                      {isShipping && (
                        <span className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                          <Truck className="w-2.5 h-2.5" />
                          Em Trânsito
                        </span>
                      )}
                      {isSold && (
                        <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3px]" />
                          Concluído
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-dark-muted mt-0.5 truncate">
                      {item.category} • {new Date(item.createdAt).toLocaleDateString("pt-PT")}
                      {item.courier && ` • ${item.courier}`}
                    </div>

                    {/* Preços e Valores Financeiros */}
                    <div className="flex items-center gap-2 mt-2">
                      {isActive && (
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-white font-mono">
                            {item.precoListado}€
                          </span>
                          <span className="text-[10px] text-vinted-400 font-medium">
                            listado
                          </span>
                        </div>
                      )}

                      {isShipping && (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-cyan-300 font-mono">
                            {item.precoVenda || item.precoListado}€
                          </span>
                          <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950/60 px-1.5 py-0.5 rounded-md border border-cyan-500/30">
                            Saldo Pendente
                          </span>
                        </div>
                      )}

                      {isSold && (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-emerald-400 font-mono">
                            {item.precoVenda || item.precoListado}€
                          </span>
                          <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                            Lucro Confirmado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Linha de Ações Interativas */}
                <div className="flex items-center justify-between pt-2.5 border-t border-dark-border/60">
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
                    {/* Botão de Transição para Item À Venda -> Registar Venda */}
                    {isActive && (
                      <button
                        type="button"
                        onClick={() => openSellModal(item)}
                        className="py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Registar Venda</span>
                      </button>
                    )}

                    {/* Botão de Transição para Item em Trânsito -> Concluir Entrega */}
                    {isShipping && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsCompleted(item.id)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Marcar Concluído</span>
                      </button>
                    )}

                    {/* Botão para Reverter para À Venda caso tenha sido engano */}
                    {(isShipping || isSold) && (
                      <button
                        type="button"
                        onClick={() => handleRevertToActive(item.id)}
                        className="py-1.5 px-2 rounded-xl bg-dark-surface border border-dark-border text-dark-muted hover:text-slate-200 text-[10px] flex items-center gap-1 transition-colors"
                        title="Voltar a colocar À Venda"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span className="hidden sm:inline">À Venda</span>
                      </button>
                    )}

                    {/* Botão de Eliminar Artigo */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-xl text-dark-muted hover:text-red-400 hover:bg-red-950/30 transition-colors"
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

      {/* ============================================================== */}
      {/* MODAL: REGISTAR VENDA (MUDA PARA AGUARDAR ENVIO / TRÂNSITO)   */}
      {/* ============================================================== */}
      {sellingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-dark-card border border-dark-border w-full max-w-sm rounded-3xl p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Registar Venda
                  </h3>
                  <p className="text-[10px] text-dark-muted truncate max-w-[200px]">
                    {sellingItem.titulo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSellingItem(null)}
                className="text-dark-muted hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Valor final da venda */}
              <div>
                <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                  Preço Final de Venda (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={salePriceInput}
                    onChange={(e) => setSalePriceInput(e.target.value)}
                    placeholder="20"
                    className="w-full bg-dark-surface border border-dark-border focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-base font-black text-white font-mono focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-cyan-400">
                    €
                  </span>
                </div>
                <span className="text-[9px] text-dark-muted mt-1 block">
                  Este valor será registado como <strong>Saldo Pendente em Trânsito</strong>.
                </span>
              </div>

              {/* Transportadora / Ponto de envio */}
              <div>
                <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                  Ponto de Envio / Transportadora
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {["InPost / Cacifo", "CTT Expresso", "Mondial Relay", "DPD Pickup"].map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCourierInput(c)}
                        className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold text-left transition-all ${
                          courierInput === c
                            ? "bg-cyan-950/60 border-cyan-500 text-cyan-300"
                            : "bg-dark-surface border-dark-border text-slate-300"
                        }`}
                      >
                        {c}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Custo de compra (opcional) */}
              <div>
                <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                  Preço de Custo / Compra (€ opcional)
                </label>
                <input
                  type="number"
                  value={costPriceInput}
                  onChange={(e) => setCostPriceInput(e.target.value)}
                  placeholder="Quanto te custou o artigo?"
                  className="w-full bg-dark-surface border border-dark-border focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmToShipping}
              className="w-full py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 active:scale-95 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>Colocar Em Trânsito (Saldo Pendente)</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADICIONAR ARTIGO MANUALMENTE EM 5 SEGUNDOS              */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <form
            onSubmit={handleAddManualItem}
            className="bg-dark-card border border-dark-border w-full max-w-sm rounded-3xl p-4 space-y-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-vinted-500/20 border border-vinted-500/40 flex items-center justify-center text-vinted-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Adicionar Artigo em 5s
                  </h3>
                  <p className="text-[10px] text-dark-muted">
                    Rápido e sem precisar de fotos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-dark-muted hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Título do artigo */}
              <div>
                <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                  Título do Artigo
                </label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Ex: Casaco Nike Vintage Preto M"
                  className="w-full bg-dark-surface border border-dark-border focus:border-vinted-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Preço Listado & Custo lado a lado */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                    Preço Listado (€) *
                  </label>
                  <input
                    type="number"
                    required
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    placeholder="25"
                    className="w-full bg-dark-surface border border-dark-border focus:border-vinted-500 rounded-xl px-3 py-2 text-sm font-black text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                    Custo (€ opcional)
                  </label>
                  <input
                    type="number"
                    value={manualCost}
                    onChange={(e) => setManualCost(e.target.value)}
                    placeholder="10"
                    className="w-full bg-dark-surface border border-dark-border focus:border-vinted-500 rounded-xl px-3 py-2 text-sm font-semibold text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Categoria rápida */}
              <div>
                <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Roupa / Streetwear",
                    "Videojogos",
                    "Hardware / Tech",
                    "Calçado",
                    "Acessórios",
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setManualCategory(cat)}
                      className={`py-1 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                        manualCategory === cat
                          ? "bg-vinted-500/20 border-vinted-500 text-vinted-300"
                          : "bg-dark-surface border-dark-border text-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado inicial */}
              <div>
                <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                  Estado Inicial
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "active" as const, label: "À Venda" },
                    { id: "shipping" as const, label: "Em Trânsito" },
                    { id: "sold" as const, label: "Concluído" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setManualStatus(s.id)}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border text-center transition-all ${
                        manualStatus === s.id
                          ? "bg-vinted-500 text-white border-vinted-400"
                          : "bg-dark-surface border-dark-border text-dark-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-vinted-500 to-vinted-accent text-white font-black text-xs flex items-center justify-center gap-2 shadow-teal-glow active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Guardar Artigo no Stock</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

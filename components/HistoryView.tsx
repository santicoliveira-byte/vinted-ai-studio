"use client";

import React, { useState } from "react";
import { Copy, Check, Trash2, Tag, Calendar, ExternalLink, Sparkles } from "lucide-react";
import { SavedListingItem } from "@/types";

interface HistoryViewProps {
  history: SavedListingItem[];
  onSelectListing: (item: SavedListingItem) => void;
  onDeleteListing: (id: string) => void;
}

export function HistoryView({
  history,
  onSelectListing,
  onDeleteListing,
}: HistoryViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyListing = async (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (history.length === 0) {
    return (
      <div className="py-16 text-center space-y-3 px-4">
        <div className="w-14 h-14 rounded-2xl bg-dark-card border border-dark-border mx-auto flex items-center justify-center text-dark-muted">
          <Tag className="w-6 h-6 text-vinted-400" />
        </div>
        <h3 className="text-sm font-bold text-white">Sem Anúncios Anteriores</h3>
        <p className="text-xs text-dark-muted max-w-xs mx-auto leading-relaxed">
          Os anúncios que gerares vão aparecer aqui para que nunca percas os teus títulos, preços ou descrições geradas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-12">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-muted">
          Anúncios Guardados ({history.length})
        </h3>
        <span className="text-[10px] text-vinted-400">Guarda até 50 artigos</span>
      </div>

      <div className="space-y-2.5">
        {history.map((item) => {
          const fullText = `${item.result.descricao_pt}\n\n${item.result.traducao_es_fr}\n\n${item.result.hashtags.join(" ")}`;

          return (
            <div
              key={item.id}
              onClick={() => onSelectListing(item)}
              className="bg-dark-card hover:bg-dark-cardHover border border-dark-border/80 hover:border-vinted-500/50 rounded-2xl p-3.5 transition-all cursor-pointer space-y-2.5 shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail}
                    alt={item.result.titulo_pt}
                    className="w-14 h-14 rounded-xl object-cover border border-dark-border shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center shrink-0 text-vinted-400 font-bold">
                    V
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate leading-snug">
                    {item.result.titulo_pt}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-dark-muted mt-1">
                    <span className="text-vinted-300 font-medium truncate">
                      {item.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(item.createdAt).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Price pill */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-vinted-500/20 text-vinted-300 border border-vinted-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.result.precos.preco_justo.valor}€ (Justo)
                    </span>
                    <span className="text-dark-muted text-[10px]">
                      {item.result.precos.venda_rapida.valor}€ Rápido
                    </span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-2 border-t border-dark-border/60">
                <span className="text-[10px] text-vinted-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  Toca para abrir detalhes
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => copyListing(e, fullText, item.id)}
                    className="px-2.5 py-1 rounded-lg bg-dark-surface hover:bg-vinted-500 text-slate-300 hover:text-white border border-dark-border text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Tudo</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteListing(item.id);
                    }}
                    className="p-1.5 rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

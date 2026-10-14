"use client";

import {
  Sparkles,
  FileText,
  MessageSquareText,
  TrendingUp,
  Settings,
} from "lucide-react";

export type NavTab = "create" | "result" | "chat" | "profit" | "settings";

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasResult: boolean;
  inventoryCount?: number;
}

export function Navigation({
  activeTab,
  onSelectTab,
  hasResult,
  inventoryCount = 0,
}: NavigationProps) {
  const tabs = [
    {
      id: "create" as NavTab,
      label: "Criar",
      icon: Sparkles,
      badge: null,
    },
    {
      id: "result" as NavTab,
      label: "Anúncio",
      icon: FileText,
      badge: hasResult ? "Novo" : null,
      disabled: !hasResult,
    },
    {
      id: "chat" as NavTab,
      label: "Negociador",
      icon: MessageSquareText,
      badge: null,
    },
    {
      id: "profit" as NavTab,
      label: "Artigos & Lucro",
      icon: TrendingUp,
      badge: inventoryCount > 0 ? inventoryCount : null,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c1215]/95 backdrop-blur-xl border-t border-dark-border/80 pt-1.5 transition-all"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)" }}
    >
      <div className="max-w-md mx-auto px-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onSelectTab(tab.id)}
              disabled={isDisabled}
              className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-150 ${
                isDisabled
                  ? "opacity-30 cursor-not-allowed"
                  : isActive
                  ? "text-vinted-400 font-bold scale-105"
                  : "text-dark-muted hover:text-slate-200 active:scale-95"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "stroke-[2.4px] text-vinted-400" : "stroke-[1.8px]"
                  }`}
                />
                {tab.badge !== null && (
                  <span
                    className={`absolute -top-1 -right-2.5 min-w-3.5 h-3.5 px-1 rounded-full text-[8px] font-black flex items-center justify-center ${
                      isActive
                        ? "bg-vinted-500 text-white shadow-teal-glow"
                        : "bg-dark-border text-slate-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9.5px] mt-1 transition-colors truncate max-w-[64px] ${
                  isActive ? "text-vinted-400 font-bold" : "text-dark-muted"
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-vinted-400 mt-0.5 shadow-teal-glow" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

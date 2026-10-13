"use client";

import { useEffect, useState } from "react";
import { Share, PlusSquare, X } from "lucide-react";

export function PwaRegister() {
  const [showIosBanner, setShowIosBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registado:", reg.scope))
        .catch((err) => console.error("Falha ao registar Service Worker:", err));
    }

    // Detect iOS Safari not in standalone mode
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    const bannerDismissed = localStorage.getItem("vinted_pwa_dismissed");

    if (isIos && !isStandalone && !bannerDismissed) {
      setShowIosBanner(true);
    }
  }, []);

  if (!showIosBanner) return null;

  return (
    <div className="fixed top-3 left-3 right-3 z-50 bg-dark-card border border-vinted-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-vinted-500/20 border border-vinted-500/40 flex items-center justify-center shrink-0 text-vinted-400">
            <PlusSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Instalar no iPhone (App PWA)</h4>
            <p className="text-[11px] text-dark-muted leading-tight mt-0.5">
              Toca em <Share className="w-3 h-3 inline text-vinted-400 mx-0.5" /> e depois em{" "}
              <strong className="text-slate-200">Adicionar ao Ecrã Principal</strong> para ecrã inteiro.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowIosBanner(false);
            localStorage.setItem("vinted_pwa_dismissed", "true");
          }}
          className="text-dark-muted hover:text-white p-1 rounded-lg"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

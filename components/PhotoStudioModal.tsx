"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Sun,
  Sliders,
  Download,
  Check,
  X,
  Crop,
  RotateCcw,
  Maximize2,
  Share2,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PhotoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSaveModifiedImage?: (newUrl: string, newBase64: string) => void;
}

type PresetMode = "original" | "auto_studio" | "bright" | "sharp";

export function PhotoStudioModal({
  isOpen,
  onClose,
  imageUrl,
  onSaveModifiedImage,
}: PhotoStudioModalProps) {
  const [activePreset, setActivePreset] = useState<PresetMode>("auto_studio");
  const [brightness, setBrightness] = useState<number>(10);
  const [contrast, setContrast] = useState<number>(12);
  const [saturation, setSaturation] = useState<number>(10);
  const [is4by5Ratio, setIs4by5Ratio] = useState<boolean>(true);
  const [processedDataUrl, setProcessedDataUrl] = useState<string>(imageUrl);
  const [isSaved, setIsSaved] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Apply Presets
  const applyPreset = (preset: PresetMode) => {
    setActivePreset(preset);
    if (preset === "original") {
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
    } else if (preset === "auto_studio") {
      setBrightness(12);
      setContrast(14);
      setSaturation(10);
    } else if (preset === "bright") {
      setBrightness(24);
      setContrast(8);
      setSaturation(6);
    } else if (preset === "sharp") {
      setBrightness(4);
      setContrast(22);
      setSaturation(12);
    }
  };

  // Render on Canvas whenever adjustments change
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let srcW = img.width;
      let srcH = img.height;

      if (is4by5Ratio) {
        // Target 4:5 ratio (width: 4, height: 5)
        // Center-crop to 4:5
        const targetRatio = 4 / 5;
        let cropW = srcW;
        let cropH = srcH;

        if (srcW / srcH > targetRatio) {
          // Wider than 4:5: crop width
          cropW = Math.round(srcH * targetRatio);
        } else {
          // Taller than 4:5: crop height
          cropH = Math.round(srcW / targetRatio);
        }

        const cropX = Math.round((srcW - cropW) / 2);
        const cropY = Math.round((srcH - cropH) / 2);

        // Max export size 1200x1500
        const outW = Math.min(cropW, 1200);
        const outH = Math.round(outW * (5 / 4));

        canvas.width = outW;
        canvas.height = outH;

        // Apply filters: brightness, contrast, saturate
        const bVal = 100 + brightness;
        const cVal = 100 + contrast;
        const sVal = 100 + saturation;
        ctx.filter = `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%)`;

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
      } else {
        // Original aspect ratio
        const maxDim = 1200;
        let outW = srcW;
        let outH = srcH;
        if (outW > maxDim || outH > maxDim) {
          if (outW > outH) {
            outH = Math.round((outH * maxDim) / outW);
            outW = maxDim;
          } else {
            outW = Math.round((outW * maxDim) / outH);
            outH = maxDim;
          }
        }

        canvas.width = outW;
        canvas.height = outH;

        const bVal = 100 + brightness;
        const cVal = 100 + contrast;
        const sVal = 100 + saturation;
        ctx.filter = `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%)`;

        ctx.drawImage(img, 0, 0, srcW, srcH, 0, 0, outW, outH);
      }

      const outUrl = canvas.toDataURL("image/jpeg", 0.9);
      setProcessedDataUrl(outUrl);
    };

    img.src = imageUrl;
  }, [isOpen, imageUrl, brightness, contrast, saturation, is4by5Ratio]);

  // Download image directly to iPhone photos
  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = processedDataUrl;
      link.download = `vinted_estudio_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#007782", "#00a8b5", "#10b981"],
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Save to ad state
  const handleApplyToAd = () => {
    if (onSaveModifiedImage && processedDataUrl) {
      const base64 = processedDataUrl.split(",")[1];
      onSaveModifiedImage(processedDataUrl, base64);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 800);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-3 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-ios-top pb-2 max-w-md w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-vinted-500/20 border border-vinted-500/40 flex items-center justify-center text-vinted-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Modo Estúdio Vinted
            </h3>
            <p className="text-[10px] text-dark-muted">
              Otimização de luz & Formato 4:5 para o feed
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-dark-card border border-dark-border text-slate-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Live Preview Screen */}
      <div className="flex-1 flex items-center justify-center py-2 max-w-md w-full mx-auto overflow-hidden">
        <div
          className={`relative rounded-2xl overflow-hidden border-2 border-vinted-500/50 shadow-2xl bg-dark-card flex items-center justify-center transition-all ${
            is4by5Ratio ? "aspect-[4/5] max-h-[50vh]" : "max-h-[50vh]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={processedDataUrl || imageUrl}
            alt="Foto Otimizada"
            className="w-full h-full object-cover"
          />

          {/* 4:5 Badge */}
          {is4by5Ratio && (
            <div className="absolute top-2 left-2 bg-dark-bg/85 backdrop-blur-md border border-dark-border text-[9px] font-bold text-vinted-300 px-2 py-0.5 rounded-full">
              Formato 4:5 Vinted
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Panel */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-3.5 space-y-3 max-w-md w-full mx-auto pb-ios-nav">
        {/* 1-Tap Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-dark-muted uppercase font-bold">
              Ajustes de 1 Toque:
            </label>
            <button
              type="button"
              onClick={() => setIs4by5Ratio(!is4by5Ratio)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                is4by5Ratio
                  ? "bg-vinted-500/20 border-vinted-500 text-vinted-300"
                  : "bg-dark-surface border-dark-border text-slate-400"
              }`}
            >
              <Crop className="w-3 h-3 inline mr-1" />
              {is4by5Ratio ? "Formato 4:5 Ativo" : "Formato Livre"}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: "auto_studio" as PresetMode, label: "✨ Estúdio", desc: "Auto" },
              { id: "bright" as PresetMode, label: "☀️ Brilho +", desc: "Claro" },
              { id: "sharp" as PresetMode, label: "🔍 Nitidez", desc: "Contraste" },
              { id: "original" as PresetMode, label: "🔄 Original", desc: "Reset" },
            ].map((p) => {
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all active:scale-95 ${
                    isSelected
                      ? "bg-vinted-500 text-white font-bold shadow-teal-glow"
                      : "bg-dark-surface border-dark-border text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="text-[11px] font-bold">{p.label}</div>
                  <div className="text-[9px] text-slate-300/80">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Apply & Download */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleDownload}
            className="py-3 px-3 rounded-2xl bg-dark-surface hover:bg-dark-cardHover border border-dark-border text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-vinted-400" />
            <span>Descarregar Imagem</span>
          </button>

          <button
            type="button"
            onClick={handleApplyToAd}
            className={`py-3 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-teal-glow ${
              isSaved
                ? "bg-emerald-600 text-white"
                : "bg-vinted-500 hover:bg-vinted-600 text-white"
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3px]" />
                <span>Foto Aplicada! ✓</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Aplicar ao Anúncio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useRef, useState } from "react";
import { Camera, Image as ImageIcon, X, Plus, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { ProcessedImage } from "@/types";
import { compressAndProcessImage } from "@/lib/imageCompression";

interface ImageUploaderProps {
  images: ProcessedImage[];
  onImagesChange: (images: ProcessedImage[]) => void;
}

const SLOT_LABELS = [
  "Capa / Frente",
  "Costas / Geral",
  "Etiqueta / Marca",
  "Detalhe / Estado",
];

export function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setStatusMessage("A comprimir fotos no iPhone...");

    try {
      const remainingSlots = 4 - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      const processedList: ProcessedImage[] = [];
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        setStatusMessage(`A comprimir ${i + 1}/${filesToProcess.length}...`);
        const processed = await compressAndProcessImage(file);
        processedList.push(processed);
      }

      const updated = [...images, ...processedList];
      onImagesChange(updated);
      setStatusMessage(null);
    } catch (err: any) {
      console.error(err);
      setStatusMessage("Erro ao comprimir imagem. Tenta novamente.");
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setIsProcessing(false);
      // Reset input values to allow re-selection
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-dark-muted flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-vinted-400" />
          Fotos do Artigo ({images.length}/4)
        </label>
        {images.length > 0 && (
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Comprimidas para upload ultrarrápido
          </span>
        )}
      </div>

      {/* Hidden File Inputs for iOS Camera & Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* 4 Photo Slots Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[0, 1, 2, 3].map((index) => {
          const item = images[index];
          const isSlotAvailable = !item;

          if (item) {
            return (
              <div
                key={item.id}
                className="relative aspect-square rounded-2xl overflow-hidden bg-dark-card border border-vinted-500/40 group shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Slot Badge */}
                <div className="absolute top-2 left-2 bg-dark-bg/80 backdrop-blur-md border border-dark-border/80 text-[10px] font-semibold text-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>#{index + 1}</span>
                  <span className="text-vinted-400 font-normal">{SLOT_LABELS[index]}</span>
                </div>

                {/* Compression Info Badge */}
                <div className="absolute bottom-2 left-2 right-2 bg-dark-bg/85 backdrop-blur-md border border-dark-border/70 text-[9px] text-dark-muted px-1.5 py-0.5 rounded-lg flex items-center justify-between">
                  <span className="text-emerald-400 font-mono font-medium">
                    {item.compressedSizeKb} KB
                  </span>
                  <span className="text-slate-400">
                    -{Math.round((1 - item.compressedSizeKb / item.originalSizeKb) * 100)}%
                  </span>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-white rounded-full flex items-center justify-center transition-transform active:scale-90"
                  aria-label="Remover foto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          return (
            <button
              key={`empty_${index}`}
              type="button"
              disabled={isProcessing}
              onClick={() => galleryInputRef.current?.click()}
              className="relative aspect-square rounded-2xl border-2 border-dashed border-dark-border/80 hover:border-vinted-500/60 bg-dark-surface/40 hover:bg-dark-card/60 flex flex-col items-center justify-center p-3 text-center transition-all group active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-dark-card group-hover:bg-vinted-500/15 border border-dark-border/80 group-hover:border-vinted-500/40 flex items-center justify-center text-dark-muted group-hover:text-vinted-400 transition-colors mb-1.5">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-300">
                Foto #{index + 1}
              </span>
              <span className="text-[10px] text-dark-muted mt-0.5">
                {SLOT_LABELS[index]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Buttons: Camera & Gallery for iPhone */}
      {images.length < 4 && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-200 text-xs font-semibold active:scale-[0.98] transition-all"
          >
            <Camera className="w-4 h-4 text-vinted-400" />
            <span>Tirar com Câmara</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-200 text-xs font-semibold active:scale-[0.98] transition-all"
          >
            <ImageIcon className="w-4 h-4 text-vinted-400" />
            <span>Escolher da Galeria</span>
          </button>
        </div>
      )}

      {/* Processing State Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-vinted-500/10 border border-vinted-500/30 text-vinted-300 text-xs animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{statusMessage || "A processar..."}</span>
        </div>
      )}
    </div>
  );
}

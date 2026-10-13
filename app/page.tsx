"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Navigation, NavTab } from "@/components/Navigation";
import { ImageUploader } from "@/components/ImageUploader";
import { CategorySelector } from "@/components/CategorySelector";
import { AntiHaggleCalculator } from "@/components/AntiHaggleCalculator";
import { QuickNotes } from "@/components/QuickNotes";
import { ResultView } from "@/components/ResultView";
import { SettingsView } from "@/components/SettingsView";
import { ChatNegotiatorView } from "@/components/ChatNegotiatorView";
import { InventoryProfitView } from "@/components/InventoryProfitView";
import { PwaRegister } from "@/components/PwaRegister";
import {
  ProcessedImage,
  GeminiListingResult,
  SavedListingItem,
  InventoryItem,
  ClothingDetails,
  TechDetails,
} from "@/types";
import { Sparkles, Loader2, AlertCircle, ShieldAlert, KeyRound } from "lucide-react";
import confetti from "canvas-confetti";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("create");

  // Input states
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [category, setCategory] = useState<string>("Streetwear & Roupa");
  const [quickNotes, setQuickNotes] = useState<string>("");

  // Feature 1: Dynamic Category Fields
  const [clothingDetails, setClothingDetails] = useState<ClothingDetails>({
    fit: "Regular Fit",
  });
  const [techDetails, setTechDetails] = useState<TechDetails>({
    testedAndWorking: true,
    pristineCondition: true,
    bubbleWrapPackaging: true,
    accessoriesIncluded: false,
  });

  // Feature 2: Anti-Haggle Calculator
  const [targetNetPrice, setTargetNetPrice] = useState<number | undefined>(undefined);
  const [suggestedListPrice, setSuggestedListPrice] = useState<number | undefined>(undefined);

  // API & Settings state
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");

  // Output & Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<GeminiListingResult | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | undefined>(undefined);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem("vinted_gemini_api_key");
      if (storedKey) setApiKey(storedKey);

      const storedModel = localStorage.getItem("vinted_gemini_model");
      if (storedModel) setSelectedModel(storedModel);

      // Load inventory items
      const storedInv = localStorage.getItem("vinted_inventory_items");
      if (storedInv) {
        setInventory(JSON.parse(storedInv));
      } else {
        // Migration from legacy history if exists
        const storedHistory = localStorage.getItem("vinted_history");
        if (storedHistory) {
          const parsedHistory: SavedListingItem[] = JSON.parse(storedHistory);
          const migrated: InventoryItem[] = parsedHistory.map((h) => ({
            id: h.id,
            createdAt: h.createdAt,
            titulo: h.result.titulo_pt,
            category: h.category,
            status: "active",
            precoListado: h.result.precos.preco_justo.valor,
            thumbnail: h.thumbnail,
            result: h.result,
          }));
          setInventory(migrated);
          localStorage.setItem("vinted_inventory_items", JSON.stringify(migrated));
        }
      }
    } catch (err) {
      console.warn("Erro ao aceder ao localStorage:", err);
    }
  }, []);

  // Save API key
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      localStorage.setItem("vinted_gemini_api_key", key);
    } catch (err) {
      console.error(err);
    }
  };

  // Save Model
  const handleSelectModel = (model: string) => {
    setSelectedModel(model);
    try {
      localStorage.setItem("vinted_gemini_model", model);
    } catch (err) {
      console.error(err);
    }
  };

  // Update Inventory
  const handleUpdateInventory = (items: InventoryItem[]) => {
    setInventory(items);
    try {
      localStorage.setItem("vinted_inventory_items", JSON.stringify(items));
    } catch (err) {
      console.error(err);
    }
  };

  // Clear data
  const handleClearHistory = () => {
    setInventory([]);
    try {
      localStorage.removeItem("vinted_inventory_items");
      localStorage.removeItem("vinted_history");
    } catch (err) {
      console.error(err);
    }
  };

  // Save generated ad into Inventory list ("Rascunhos / À Venda")
  const handleSaveToInventory = (result: GeminiListingResult, chosenPrice: number) => {
    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
      titulo: result.titulo_pt,
      category,
      status: "active",
      precoListado: chosenPrice,
      thumbnail: currentThumbnail || images[0]?.previewUrl,
      result,
    };

    const updated = [newItem, ...inventory];
    handleUpdateInventory(updated);
  };

  // Reset creation form
  const handleReset = () => {
    setImages([]);
    setQuickNotes("");
    setClothingDetails({ fit: "Regular Fit" });
    setTechDetails({
      testedAndWorking: true,
      pristineCondition: true,
      bubbleWrapPackaging: true,
      accessoriesIncluded: false,
    });
    setTargetNetPrice(undefined);
    setSuggestedListPrice(undefined);
    setCurrentResult(null);
    setCurrentThumbnail(undefined);
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Trigger ad generation
  const handleGenerate = async () => {
    if (images.length === 0) {
      setErrorMessage("Por favor adiciona pelo menos 1 foto do artigo.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const payload = {
        images: images.map((img) => ({
          base64Data: img.base64Data,
          mimeType: img.mimeType,
        })),
        category,
        quickNotes,
        clothingDetails,
        techDetails,
        antiHaggle: {
          targetNetPrice,
          suggestedListPrice,
        },
        customApiKey: apiKey,
        customModel: selectedModel,
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(
          resData.error || "Ocorreu um erro ao comunicar com a IA. Tenta novamente."
        );
      }

      const generatedData: GeminiListingResult = resData.data;
      setCurrentResult(generatedData);
      setCurrentThumbnail(images[0]?.previewUrl);

      // Auto-save item to "À Venda" list as well
      const autoSavedItem: InventoryItem = {
        id: `inv_${Date.now()}`,
        createdAt: new Date().toISOString(),
        titulo: generatedData.titulo_pt,
        category,
        status: "active",
        precoListado:
          suggestedListPrice || generatedData.precos.preco_justo.valor,
        thumbnail: images[0]?.previewUrl,
        result: generatedData,
      };

      const updatedInv = [autoSavedItem, ...inventory];
      handleUpdateInventory(updatedInv);

      // Switch to result view
      setActiveTab("result");
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Celebration
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#007782", "#00a8b5", "#10b981", "#ffffff"],
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || "Erro inesperado ao gerar anúncio. Tenta de novo."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark-bg text-slate-100 flex flex-col justify-between selection:bg-vinted-500 selection:text-white">
      {/* PWA iOS Add to Home Banner */}
      <PwaRegister />

      {/* Top Header */}
      <Header
        onOpenSettings={() => setActiveTab("settings")}
        hasCustomKey={Boolean(apiKey)}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-28">
        {/* Error notification if any */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="leading-relaxed">{errorMessage}</p>
              {errorMessage.includes("chave") && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setActiveTab("settings");
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-vinted-400 underline underline-offset-2"
                >
                  <KeyRound className="w-3 h-3" />
                  Abrir Definições para inserir Chave
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: CREATE VIEW */}
        {activeTab === "create" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Step 1: Photos */}
            <ImageUploader
              images={images}
              onImagesChange={(imgs) => {
                setImages(imgs);
                if (errorMessage) setErrorMessage(null);
              }}
            />

            {/* Step 2: Category & Dynamic Fields (Fit/Medidas ou Garantias Tech) */}
            <CategorySelector
              selectedCategory={category}
              onSelectCategory={setCategory}
              clothingDetails={clothingDetails}
              onClothingDetailsChange={setClothingDetails}
              techDetails={techDetails}
              onTechDetailsChange={setTechDetails}
            />

            {/* Step 3: Anti-Haggle Calculator */}
            <AntiHaggleCalculator
              targetNetPrice={targetNetPrice}
              onTargetNetPriceChange={setTargetNetPrice}
              onSuggestedListPriceChange={setSuggestedListPrice}
            />

            {/* Step 4: Quick Notes */}
            <QuickNotes notes={quickNotes} onNotesChange={setQuickNotes} />

            {/* Warning if no key configured */}
            {!apiKey && (
              <div className="p-3 rounded-2xl bg-dark-card border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px]">Chave API ainda não inserida</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className="text-[11px] font-bold text-vinted-400 hover:text-vinted-300"
                >
                  Inserir (Grátis) →
                </button>
              </div>
            )}

            {/* Primary Action Button: "Gerar Anúncio Pro" */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isGenerating || images.length === 0}
                onClick={handleGenerate}
                className={`w-full py-4 px-6 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-[0.98] ${
                  images.length === 0
                    ? "bg-dark-surface border border-dark-border text-dark-muted cursor-not-allowed"
                    : isGenerating
                    ? "bg-vinted-700 text-white cursor-wait animate-pulse"
                    : "bg-gradient-to-r from-vinted-500 to-vinted-accent text-white shadow-teal-glow hover:brightness-110"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>A Analisar com Gemini Vision...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Gerar Anúncio Pro</span>
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-dark-muted mt-2">
                Gera título SEO, 3 preços em €, medidas/garantias e traduções ES/FR
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: RESULT VIEW */}
        {activeTab === "result" && currentResult && (
          <div className="animate-in fade-in duration-150">
            <ResultView
              result={currentResult}
              onReset={handleReset}
              onSaveToInventory={handleSaveToInventory}
              isSavedToInventory={true}
            />
          </div>
        )}

        {/* TAB 3: CHAT & NEGOTIATOR VIEW */}
        {activeTab === "chat" && (
          <ChatNegotiatorView
            apiKey={apiKey}
            selectedModel={selectedModel}
          />
        )}

        {/* TAB 4: MY ITEMS & PROFIT VIEW */}
        {activeTab === "profit" && (
          <InventoryProfitView
            items={inventory}
            onUpdateItems={handleUpdateInventory}
            onOpenListing={(listing) => {
              setCurrentResult(listing);
              setActiveTab("result");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* TAB 5: SETTINGS VIEW */}
        {activeTab === "settings" && (
          <div className="animate-in fade-in duration-150">
            <SettingsView
              apiKey={apiKey}
              onSaveApiKey={handleSaveApiKey}
              selectedModel={selectedModel}
              onSelectModel={handleSelectModel}
              onClearHistory={handleClearHistory}
            />
          </div>
        )}
      </div>

      {/* iOS Safe Area Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        hasResult={Boolean(currentResult)}
        inventoryCount={inventory.length}
      />
    </main>
  );
}

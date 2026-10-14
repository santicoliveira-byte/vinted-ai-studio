"use client";

import React, { useState, useRef } from "react";
import {
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Cpu,
  Trash2,
  Smartphone,
  Save,
  Loader2,
  ShieldCheck,
  Download,
  Upload,
  Database,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { InventoryItem } from "@/types";

interface SettingsViewProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onClearHistory: () => void;
  inventoryItems?: InventoryItem[];
  onImportInventory?: (items: InventoryItem[]) => void;
}

export function SettingsView({
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
  onClearHistory,
  inventoryItems = [],
  onImportInventory,
}: SettingsViewProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Backup state
  const [backupMessage, setBackupMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const testConnection = async () => {
    const keyToTest = inputKey.trim();
    if (!keyToTest) {
      setTestResult({
        success: false,
        message: "Por favor insere uma chave antes de testar.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${keyToTest}`;
      const res = await fetch(testUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Responde apenas OK" }] }],
        }),
      });

      if (res.ok) {
        setTestResult({
          success: true,
          message: "Ligação ao Gemini bem-sucedida! Chave ativa e válida.",
        });
        onSaveApiKey(keyToTest);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setTestResult({
          success: false,
          message:
            errorData?.error?.message ||
            "Erro ao validar a chave. Verifica se a chave foi copiada corretamente.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: "Falha de rede ao testar o Gemini. Verifica a tua ligação.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Exportar Backup JSON
  const handleExportBackup = () => {
    try {
      const backupData = {
        app: "Vinted AI Studio",
        version: "2.0",
        exportedAt: new Date().toISOString(),
        itemsCount: inventoryItems.length,
        items: inventoryItems,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split("T")[0];

      const a = document.createElement("a");
      a.href = url;
      a.download = `vinted_studio_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupMessage({
        type: "success",
        text: `Backup exportado com sucesso! (${inventoryItems.length} artigos salvaguardados)`,
      });

      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#007782", "#00a8b5", "#10b981"],
        });
      } catch {
        // ignore
      }

      setTimeout(() => setBackupMessage(null), 4000);
    } catch (err) {
      setBackupMessage({
        type: "error",
        text: "Erro ao gerar o ficheiro de backup.",
      });
    }
  };

  // Importar Backup JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let itemsToImport: InventoryItem[] = [];

        if (Array.isArray(parsed)) {
          itemsToImport = parsed;
        } else if (parsed && Array.isArray(parsed.items)) {
          itemsToImport = parsed.items;
        } else {
          throw new Error("Formato de ficheiro de backup inválido.");
        }

        if (onImportInventory) {
          onImportInventory(itemsToImport);
        }

        setBackupMessage({
          type: "success",
          text: `Backup importado com sucesso! (${itemsToImport.length} artigos restaurados)`,
        });

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.7 },
            colors: ["#10b981", "#007782", "#ffffff"],
          });
        } catch {
          // ignore
        }

        setTimeout(() => setBackupMessage(null), 4000);
      } catch (err: any) {
        setBackupMessage({
          type: "error",
          text: err.message || "Erro ao ler o ficheiro JSON de backup.",
        });
      }
    };

    reader.readAsText(file);
    // Reset file input value
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-150">
      {/* 1. SECÇÃO DA CHAVE GEMINI API */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-4 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-vinted-500/20 border border-vinted-500/40 flex items-center justify-center text-vinted-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Chave da Gemini API
              </h3>
              <p className="text-[10px] text-dark-muted">
                Guardada em segurança no localStorage do teu iPhone
              </p>
            </div>
          </div>
          {apiKey && (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Ativa
            </span>
          )}
        </div>

        {/* Input da Chave */}
        <div className="relative">
          <input
            data-selectable="true"
            type={showKey ? "text" : "password"}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Cola aqui a tua chave (AIzaSy...)"
            className="w-full bg-dark-surface border border-dark-border/80 focus:border-vinted-500 rounded-xl px-3.5 py-3 pr-10 text-xs text-white placeholder:text-dark-muted/60 focus:outline-none font-mono"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white p-1"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Botões Guardar e Testar */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-3 rounded-xl bg-vinted-500 hover:bg-vinted-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-teal-glow"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? "Guardado! ✓" : "Guardar no iPhone"}</span>
          </button>

          <button
            type="button"
            disabled={isTesting || !inputKey}
            onClick={testConnection}
            className="py-2.5 px-3 rounded-xl bg-dark-surface hover:bg-dark-cardHover border border-dark-border text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40"
          >
            {isTesting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-vinted-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-vinted-400" />
            )}
            <span>Testar Chave</span>
          </button>
        </div>

        {/* Resultado do Teste */}
        {testResult && (
          <div
            className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
              testResult.success
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/40 border-red-500/40 text-red-300"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            )}
            <span className="text-[11px] leading-tight">{testResult.message}</span>
          </div>
        )}

        {/* Ajuda Chave Grátis */}
        <div className="pt-1">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-dark-surface/80 border border-dark-border/60 hover:border-vinted-500/40 text-[11px] text-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between text-vinted-400 font-semibold mb-1">
              <span>Como obter uma chave Grátis?</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
            <p className="text-dark-muted leading-tight">
              Abre o <strong>Google AI Studio</strong> (100% gratuito), clica em &quot;Get API key&quot; e cola-a aqui. Também podes definir <code className="text-slate-300 font-mono">GEMINI_API_KEY</code> na Vercel.
            </p>
          </a>
        </div>
      </div>

      {/* 2. SELETOR DE MODELO GEMINI */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-vinted-500/20 border border-vinted-500/40 flex items-center justify-center text-vinted-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Modelo Gemini
            </h3>
            <p className="text-[10px] text-dark-muted">
              Motor multimodal de análise de imagem e criação de anúncios
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {[
            {
              id: "gemini-2.5-flash",
              name: "Gemini 2.5 Flash",
              badge: "⭐ Recomendado",
              desc: "Ultra-rápido c/ visão • Melhor equilíbrio para o dia a dia",
            },
            {
              id: "gemini-3.8-flash",
              name: "Gemini 3.8 Flash",
              badge: "⚡ Nova Geração",
              desc: "Velocidade máxima e precisão otimizada para vendas",
            },
            {
              id: "gemini-2.5-pro",
              name: "Gemini 2.5 Pro",
              badge: "🧠 Raciocínio Pro",
              desc: "Análise ultra-detalhada para artigos raros, vintage e tech",
            },
          ].map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectModel(m.id)}
                className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.99] flex items-start justify-between gap-2 ${
                  isSelected
                    ? "bg-vinted-500/20 border-vinted-500 text-white shadow-teal-glow ring-1 ring-vinted-500/40"
                    : "bg-dark-surface border-dark-border text-slate-300 hover:text-white"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{m.name}</span>
                    <span className="text-[9px] bg-dark-card px-1.5 py-0.5 rounded-full border border-dark-border text-vinted-300 font-semibold">
                      {m.badge}
                    </span>
                  </div>
                  <div className="text-[10px] text-dark-muted mt-0.5 leading-snug">
                    {m.desc}
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-vinted-400 shrink-0 mt-0.5 stroke-[3px]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. EXPORTAR / IMPORTAR BACKUP DOS MEUS ARTIGOS (JSON) */}
      <div className="bg-gradient-to-br from-[#0c1f24] via-dark-card to-dark-surface border border-vinted-500/40 rounded-3xl p-4 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-vinted-500/20 border border-vinted-500/40 flex items-center justify-center text-vinted-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Backup dos Meus Artigos (JSON)
              </h3>
              <p className="text-[10px] text-dark-muted">
                Evita perder o teu histórico de vendas se limpares o Safari
              </p>
            </div>
          </div>
          <span className="text-[10px] text-vinted-300 font-mono font-bold bg-dark-surface px-2 py-0.5 rounded-full border border-dark-border">
            {inventoryItems.length} artigos
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          Guarda uma cópia de segurança em ficheiro JSON no teu iPhone (em &quot;Ficheiros&quot;) ou restaura um backup anterior a qualquer momento.
        </p>

        {/* Botões de Ação de Backup */}
        <div className="grid grid-cols-2 gap-2">
          {/* Botão Exportar */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-2xl bg-vinted-500 hover:bg-vinted-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-teal-glow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Backup</span>
          </button>

          {/* Botão Importar */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-2xl bg-dark-surface hover:bg-dark-cardHover border border-vinted-500/50 text-vinted-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar JSON</span>
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Mensagem de Feedback de Backup */}
        {backupMessage && (
          <div
            className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in duration-200 ${
              backupMessage.type === "success"
                ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
                : "bg-rose-950/50 border-rose-500/50 text-rose-200"
            }`}
          >
            {backupMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="text-[11px] leading-tight font-medium">
              {backupMessage.text}
            </span>
          </div>
        )}
      </div>

      {/* 4. DICAS PWA IPHONE */}
      <div className="bg-dark-card border border-dark-border rounded-3xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Smartphone className="w-4 h-4 text-vinted-400" />
          <span>Dica iPhone (Ecrã Inteiro sem Safari)</span>
        </div>
        <p className="text-[11px] text-dark-muted leading-relaxed">
          No Safari do teu iPhone, toca no botão <strong>Partilhar (ícone do quadrado com seta)</strong> e escolhe <strong>&quot;Adicionar ao Ecrã Principal&quot;</strong>. A app abrirá em ecrã inteiro como uma aplicação nativa iOS!
        </p>
      </div>

      {/* 5. LIMPAR HISTÓRICO LOCAL */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                "Tens a certeza que queres limpar todo o histórico local de artigos? Faz um backup antes se quiseres guardar."
              )
            ) {
              onClearHistory();
            }
          }}
          className="w-full py-2.5 px-3 rounded-2xl bg-dark-surface hover:bg-red-950/40 border border-dark-border hover:border-red-500/40 text-red-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpar Histórico Local de Artigos</span>
        </button>
      </div>
    </div>
  );
}

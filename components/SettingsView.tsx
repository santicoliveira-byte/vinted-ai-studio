"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface SettingsViewProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onClearHistory: () => void;
}

export function SettingsView({
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
  onClearHistory,
}: SettingsViewProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

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
      // Test Gemini generateContent with tiny payload
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

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-vinted-500/20 border border-vinted-500/40 flex items-center justify-center text-vinted-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Chave da Gemini API
              </h3>
              <p className="text-[10px] text-dark-muted">
                Guardada em segurança no localStorage do teu iPhone
              </p>
            </div>
          </div>
          {apiKey && (
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Configurada
            </span>
          )}
        </div>

        {/* Input box */}
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

        {/* Save & Test Buttons */}
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

        {/* Test Result Message */}
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

        {/* Info box: How to get key */}
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

      {/* Model Choice */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-vinted-500/20 border border-vinted-500/40 flex items-center justify-center text-vinted-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Modelo Gemini
            </h3>
            <p className="text-[10px] text-dark-muted">
              Motor multimodal de análise de imagem
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            {
              id: "gemini-2.5-flash",
              name: "Gemini 2.5 Flash",
              desc: "Recomendado (Ultra-rápido c/ visão)",
            },
            {
              id: "gemini-1.5-flash",
              name: "Gemini 1.5 Flash",
              desc: "Fallback de alta velocidade",
            },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectModel(m.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedModel === m.id
                  ? "bg-vinted-500/20 border-vinted-500 text-white shadow-teal-glow"
                  : "bg-dark-surface border-dark-border text-slate-300 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold">{m.name}</div>
              <div className="text-[10px] text-dark-muted mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* iOS PWA Tips */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Smartphone className="w-4 h-4 text-vinted-400" />
          <span>Dica iPhone (Ecrã Inteiro sem Safari)</span>
        </div>
        <p className="text-[11px] text-dark-muted leading-relaxed">
          No Safari do teu iPhone, toca no botão <strong>Partilhar (ícone do quadrado com seta)</strong> e escolhe <strong>&quot;Adicionar ao Ecrã Principal&quot;</strong>. A app abrirá em ecrã inteiro sem barras do navegador, com o layout otimizado.
        </p>
      </div>

      {/* Clear Cache */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            if (confirm("Tens a certeza que queres limpar o histórico local de anúncios?")) {
              onClearHistory();
            }
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-dark-surface hover:bg-red-950/40 border border-dark-border hover:border-red-500/40 text-red-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpar Histórico Local de Anúncios</span>
        </button>
      </div>
    </div>
  );
}

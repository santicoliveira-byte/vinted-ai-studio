"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Copy,
  Check,
  Zap,
  PackageCheck,
  Star,
  Send,
  Sparkles,
  Bot,
  Loader2,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ChatNegotiatorViewProps {
  apiKey?: string;
  selectedModel?: string;
}

type ScenarioType = "counter_offer" | "shipped_locker" | "request_review" | "ai_custom";

export function ChatNegotiatorView({
  apiKey,
  selectedModel = "gemini-2.5-flash",
}: ChatNegotiatorViewProps) {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("counter_offer");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inputs for Scenario 1: Contraproposta
  const [offeredPrice, setOfferedPrice] = useState<string>("15");
  const [counterPrice, setCounterPrice] = useState<string>("22");
  const [itemTitle, setItemTitle] = useState<string>("");

  // Inputs for Scenario 2: Envio Cacifo
  const [courier, setCourier] = useState<string>("InPost / Cacifo Locker");

  // Inputs for Scenario 4: AI Custom Assistant
  const [buyerMessage, setBuyerMessage] = useState<string>("");
  const [aiIntent, setAiIntent] = useState<string>("recusar_educado");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResponses, setAiResponses] = useState<{
    pt?: string;
    targetLang?: string;
    langName?: string;
  } | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedKey(key);
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#007782", "#00a8b5", "#10b981"],
        });
      } catch {
        // ignore
      }
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Scenario 1 Texts
  const offerPt = `Olá! Agradeço a tua oferta de ${offeredPrice}€${itemTitle ? ` para o(a) ${itemTitle}` : ""}, mas infelizmente fica muito abaixo do valor do artigo. O mínimo absoluto que consigo fazer para fecharmos já é ${counterPrice}€. Se aceitares, envia a proposta pela app e garanto envio bem protegido em 24h! 😊📦`;

  const offerEs = `¡Hola! Gracias por tu oferta de ${offeredPrice}€${itemTitle ? ` por el/la ${itemTitle}` : ""}, pero lamentablemente queda muy por debajo del valor. El mínimo absoluto que puedo aceptar para cerrar el trato es de ${counterPrice}€. Si te parece bien, envía la oferta por la app y te lo preparo hoy mismo. ¡Un saludo! 😊📦`;

  const offerFr = `Bonjour ! Merci pour votre offre de ${offeredPrice}€${itemTitle ? ` pour l'article ${itemTitle}` : ""}, mais cela reste malheureusement trop bas par rapport à sa valeur. Mon prix minimum absolu pour finaliser la vente aujourd'hui est de ${counterPrice}€. Si cela vous convient, vous pouvez faire l'offre dans l'application et j'expédie le colis sous 24h ! Bonne journée 😊📦`;

  // Scenario 2 Texts
  const shippedPt = `Olá! A tua encomenda já foi depositada com sucesso no ${courier}. O pacote vai muito bem protegido e acondicionado. Já deves conseguir acompanhar o estado do envio aqui no rastreio da Vinted. Muito obrigado pela compra e qualquer dúvida estou ao dispor! 📦✨`;

  const shippedEs = `¡Hola! Tu paquete ya ha sido depositado correctamente en el ${courier}. Va súper bien embalado y protegido. Ya puedes comprobar el estado del envío directamente en el seguimiento de la app de Vinted. ¡Muchas gracias por la compra y que lo disfrutes! 📦✨`;

  const shippedFr = `Bonjour ! Votre colis a bien été déposé au point ${courier}. Il est soigneusement emballé et bien protégé. Le suivi de livraison est désormais actif directement dans l'application Vinted. Merci beaucoup pour votre achat et à très bientôt ! 📦✨`;

  // Scenario 3 Texts
  const reviewPt = `Olá! Vi que a tua encomenda já foi entregue com sucesso. Espero que tenhas gostado muito do artigo e que corresponda às tuas expectativas! Se correu tudo bem, agradecer-te-ia imenso se pudesses deixar uma avaliação de 5 estrelas aqui na Vinted. Ajuda imenso a minha conta! Muito obrigado e boas compras! ⭐⭐⭐⭐⭐`;

  const reviewEs = `¡Hola! He visto que tu paquete ya ha sido entregado con éxito. ¡Espero que te encante el artículo y que todo esté perfecto! Si estás satisfecho(a), te agradecería de corazón que me dejes una valoración de 5 estrellas en Vinted. ¡Ayuda muchísimo a mi perfil! ¡Muchas gracias y hasta la próxima! ⭐⭐⭐⭐⭐`;

  const reviewFr = `Bonjour ! J'ai vu que votre commande a bien été livrée. J'espère que l'article vous plaît et correspond parfaitement à ce que vous attendiez ! Si tout s'est bien passé, ce serait très gentil de me laisser un avis 5 étoiles sur Vinted. Cela m'aide énormément ! Merci beaucoup et bonne journée ! ⭐⭐⭐⭐⭐`;

  // AI Assistant trigger
  const handleGenerateAiResponse = async () => {
    if (!buyerMessage.trim()) return;
    setAiGenerating(true);
    setAiResponses(null);

    try {
      const intentPrompts: Record<string, string> = {
        recusar_educado: "Recusar educadamente qualquer pedido descabido mantendo o cliente simpático.",
        contraproposta: `Dizer que o preço mínimo é ${counterPrice || "20"}€ e que envio em 24h.`,
        medidas_detalhes: "Dizer que as medidas e detalhes estão indicados na descrição e nas fotos do anúncio.",
        confirmar_envio: "Garantir que o envio é feito no próprio dia ou em menos de 24h bem embalado.",
      };

      const prompt = `És um assistente de vendas da Vinted. O comprador enviou esta mensagem:
"${buyerMessage}"

O vendedor quer responder com a seguinte intenção: ${intentPrompts[aiIntent] || aiIntent}.

Identifica a língua do comprador (se for Francês, Espanhol, Inglês ou Português).
Devolve APENAS um objeto JSON válido no formato:
{
  "langName": "Francês / Espanhol / etc.",
  "targetLang": "Mensagem educada e persuasiva na língua do comprador pronta para colar no chat da Vinted com emojis simpáticos",
  "pt": "Tradução ou versão em Português para o vendedor perceber"
}`;

      const finalKey = apiKey?.trim() || "";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${finalKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (!res.ok) {
        throw new Error("Falha na chamada à IA. Verifica a tua chave API nas Definições.");
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);
      setAiResponses(parsed);
    } catch (err: any) {
      alert(err.message || "Erro ao gerar resposta com IA.");
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d2226] via-dark-card to-dark-surface border border-vinted-500/30 rounded-2xl p-3.5">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-vinted-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Assistente de Negociação & Chat
          </h2>
        </div>
        <p className="text-[11px] text-dark-muted leading-tight">
          Respostas prontas com 1 toque em <strong>Português</strong>,{" "}
          <strong>Espanhol</strong> e <strong>Francês</strong> para os mercados Vinted.
        </p>
      </div>

      {/* Scenario Tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveScenario("counter_offer")}
          className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
            activeScenario === "counter_offer"
              ? "bg-vinted-500/20 border-vinted-500 text-white shadow-teal-glow"
              : "bg-dark-card border-dark-border text-slate-300 hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold leading-tight">Contraproposta</div>
            <div className="text-[9px] text-dark-muted mt-0.5">Recusar oferta baixa</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveScenario("shipped_locker")}
          className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
            activeScenario === "shipped_locker"
              ? "bg-vinted-500/20 border-vinted-500 text-white shadow-teal-glow"
              : "bg-dark-card border-dark-border text-slate-300 hover:text-white"
          }`}
        >
          <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold leading-tight">Envio no Cacifo</div>
            <div className="text-[9px] text-dark-muted mt-0.5">Avisar comprador</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveScenario("request_review")}
          className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
            activeScenario === "request_review"
              ? "bg-vinted-500/20 border-vinted-500 text-white shadow-teal-glow"
              : "bg-dark-card border-dark-border text-slate-300 hover:text-white"
          }`}
        >
          <Star className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold leading-tight">Pedir 5 Estrelas</div>
            <div className="text-[9px] text-dark-muted mt-0.5">Pós-entrega</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveScenario("ai_custom")}
          className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
            activeScenario === "ai_custom"
              ? "bg-vinted-500/20 border-vinted-500 text-white shadow-teal-glow"
              : "bg-dark-card border-dark-border text-slate-300 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-vinted-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold leading-tight">IA Mensagens</div>
            <div className="text-[9px] text-dark-muted mt-0.5">Responder a dúvidas</div>
          </div>
        </button>
      </div>

      {/* SCENARIO 1: CONTRAPROPOSTA */}
      {activeScenario === "counter_offer" && (
        <div className="space-y-3">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Recusar Oferta Baixa & Propor Preço Mínimo</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                  Comprador Ofereceu (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(e.target.value)}
                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm font-bold text-white font-mono focus:border-vinted-500 focus:outline-none"
                    placeholder="15"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dark-muted">
                    €
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                  O Meu Mínimo Aceite (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="w-full bg-dark-surface border border-vinted-500/60 rounded-xl px-3 py-2 text-sm font-bold text-vinted-300 font-mono focus:border-vinted-500 focus:outline-none"
                    placeholder="22"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-vinted-400">
                    €
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                Nome do Artigo (Opcional)
              </label>
              <input
                type="text"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="Ex: casaco, ténis Nike, jogo..."
                className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:border-vinted-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Response Cards (PT, ES, FR) */}
          <div className="space-y-2.5">
            {/* PT */}
            <ResponseCard
              flag="🇵🇹"
              langName="Português (Compradores PT)"
              text={offerPt}
              onCopy={() => copyToClipboard(offerPt, "offer_pt")}
              isCopied={copiedKey === "offer_pt"}
            />

            {/* ES */}
            <ResponseCard
              flag="🇪🇸"
              langName="Espanhol (Compradores Espanha)"
              text={offerEs}
              onCopy={() => copyToClipboard(offerEs, "offer_es")}
              isCopied={copiedKey === "offer_es"}
            />

            {/* FR */}
            <ResponseCard
              flag="🇫🇷"
              langName="Francês (Compradores França / Bélgica)"
              text={offerFr}
              onCopy={() => copyToClipboard(offerFr, "offer_fr")}
              isCopied={copiedKey === "offer_fr"}
            />
          </div>
        </div>
      )}

      {/* SCENARIO 2: AVISAR ENVIO */}
      {activeScenario === "shipped_locker" && (
        <div className="space-y-3">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Avisar Envio no Cacifo / Ponto de Recolha
            </h3>

            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1.5">
                Ponto de Envio / Transportadora
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "InPost / Cacifo Locker",
                  "Ponto DPD Pickup",
                  "Mondial Relay",
                  "Posto CTT Expresso",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCourier(item)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold transition-all text-left ${
                      courier === item
                        ? "bg-vinted-500/20 border-vinted-500 text-vinted-300"
                        : "bg-dark-surface border-dark-border text-slate-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <ResponseCard
              flag="🇵🇹"
              langName="Português"
              text={shippedPt}
              onCopy={() => copyToClipboard(shippedPt, "ship_pt")}
              isCopied={copiedKey === "ship_pt"}
            />
            <ResponseCard
              flag="🇪🇸"
              langName="Espanhol"
              text={shippedEs}
              onCopy={() => copyToClipboard(shippedEs, "ship_es")}
              isCopied={copiedKey === "ship_es"}
            />
            <ResponseCard
              flag="🇫🇷"
              langName="Francês"
              text={shippedFr}
              onCopy={() => copyToClipboard(shippedFr, "ship_fr")}
              isCopied={copiedKey === "ship_fr"}
            />
          </div>
        </div>
      )}

      {/* SCENARIO 3: PEDIR 5 ESTRELAS */}
      {activeScenario === "request_review" && (
        <div className="space-y-3">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Pedir Avaliação de 5 Estrelas (Pós-Entrega)</span>
            </h3>
            <p className="text-[11px] text-dark-muted">
              Mensagens amigáveis para enviar quando o tracking indicar entregue, aumentando as tuas reviews 5 estrelas.
            </p>
          </div>

          <div className="space-y-2.5">
            <ResponseCard
              flag="🇵🇹"
              langName="Português"
              text={reviewPt}
              onCopy={() => copyToClipboard(reviewPt, "rev_pt")}
              isCopied={copiedKey === "rev_pt"}
            />
            <ResponseCard
              flag="🇪🇸"
              langName="Espanhol"
              text={reviewEs}
              onCopy={() => copyToClipboard(reviewEs, "rev_es")}
              isCopied={copiedKey === "rev_es"}
            />
            <ResponseCard
              flag="🇫🇷"
              langName="Francês"
              text={reviewFr}
              onCopy={() => copyToClipboard(reviewFr, "rev_fr")}
              isCopied={copiedKey === "rev_fr"}
            />
          </div>
        </div>
      )}

      {/* SCENARIO 4: IA RESPOSTA LIVRE */}
      {activeScenario === "ai_custom" && (
        <div className="space-y-3">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-vinted-400" />
              <span>Tradutor & Resposta com Gemini AI</span>
            </h3>

            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1">
                Cola a mensagem do comprador (qualquer língua)
              </label>
              <textarea
                data-selectable="true"
                value={buyerMessage}
                onChange={(e) => setBuyerMessage(e.target.value)}
                placeholder="Ex: 'Bonjour c'est possible d'avoir les mesures des aisselles svp?' ou 'Hola puedes bajar el precio?'"
                rows={3}
                className="w-full bg-dark-surface border border-dark-border rounded-xl p-3 text-xs text-white focus:border-vinted-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1.5">
                Objetivo da tua resposta:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "recusar_educado", label: "Recusar educadamente" },
                  { id: "contraproposta", label: "Fazer contraproposta" },
                  { id: "medidas_detalhes", label: "Medidas na descrição" },
                  { id: "confirmar_envio", label: "Envio rápido em 24h" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAiIntent(item.id)}
                    className={`p-2 rounded-xl border text-[10px] font-semibold text-left transition-all ${
                      aiIntent === item.id
                        ? "bg-vinted-500/20 border-vinted-500 text-vinted-300"
                        : "bg-dark-surface border-dark-border text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={aiGenerating || !buyerMessage.trim()}
              onClick={handleGenerateAiResponse}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-teal-glow active:scale-95 ${
                !buyerMessage.trim()
                  ? "bg-dark-surface text-dark-muted border border-dark-border cursor-not-allowed"
                  : "bg-vinted-500 hover:bg-vinted-600 text-white"
              }`}
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A gerar resposta com Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Resposta com IA</span>
                </>
              )}
            </button>
          </div>

          {/* AI Result Card */}
          {aiResponses && aiResponses.targetLang && (
            <div className="space-y-2 animate-in fade-in">
              <ResponseCard
                flag="🌍"
                langName={`Resposta em ${aiResponses.langName || "Língua do Comprador"}`}
                text={aiResponses.targetLang}
                onCopy={() =>
                  copyToClipboard(aiResponses.targetLang!, "ai_target")
                }
                isCopied={copiedKey === "ai_target"}
              />

              {aiResponses.pt && (
                <div className="p-3 bg-dark-card/60 border border-dark-border/60 rounded-xl text-[11px] text-dark-muted">
                  <strong className="text-slate-300 block mb-0.5">
                    Tradução em Português:
                  </strong>
                  {aiResponses.pt}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ResponseCardProps {
  flag: string;
  langName: string;
  text: string;
  onCopy: () => void;
  isCopied: boolean;
}

function ResponseCard({ flag, langName, text, onCopy, isCopied }: ResponseCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-2 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
          <span className="text-sm">{flag}</span>
          <span>{langName}</span>
        </span>
        <span className="text-[10px] text-dark-muted font-mono">{text.length} chars</span>
      </div>

      <div
        data-selectable="true"
        className="bg-dark-surface border border-dark-border/80 rounded-xl p-3 text-xs text-slate-200 leading-relaxed select-text"
      >
        {text}
      </div>

      <button
        type="button"
        onClick={onCopy}
        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
          isCopied
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
            : "bg-vinted-500 hover:bg-vinted-600 text-white shadow-teal-glow"
        }`}
      >
        {isCopied ? (
          <>
            <Check className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Copiado! Pronto a Colar</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar Resposta (1 Toque)</span>
          </>
        )}
      </button>
    </div>
  );
}

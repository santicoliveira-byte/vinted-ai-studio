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
  Languages,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ChatNegotiatorViewProps {
  apiKey?: string;
  selectedModel?: string;
}

type TabMode = "quick_reply" | "counter_offer" | "shipped_locker" | "request_review";
type TargetLang = "fr" | "es" | "it" | "pt";
type ActionIntent = "accept" | "counter" | "explain" | "shipping";

interface LangOption {
  id: TargetLang;
  flag: string;
  label: string;
}

const LANGUAGES: LangOption[] = [
  { id: "fr", flag: "🇫🇷", label: "Francês" },
  { id: "es", flag: "🇪🇸", label: "Espanhol" },
  { id: "it", flag: "🇮🇹", label: "Italiano" },
  { id: "pt", flag: "🇵🇹", label: "Português" },
];

export function ChatNegotiatorView({
  apiKey,
  selectedModel = "gemini-2.5-flash",
}: ChatNegotiatorViewProps) {
  const [activeTab, setActiveTab] = useState<TabMode>("quick_reply");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // FEATURE: TRADUTOR & ASSISTENTE DE NEGOCIAÇÃO
  const [buyerMessage, setBuyerMessage] = useState<string>("");
  const [selectedLang, setSelectedLang] = useState<TargetLang>("fr");
  const [actionIntent, setActionIntent] = useState<ActionIntent>("counter");
  const [counterPriceInput, setCounterPriceInput] = useState<string>("20");
  const [conditionDetail, setConditionDetail] = useState<string>(
    "impecavel_fotos"
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiCustomResponse, setAiCustomResponse] = useState<string | null>(null);

  // SCENARIO 2: AVISAR ENVIO CACIFO
  const [courier, setCourier] = useState<string>("InPost / Cacifo Locker");

  // Copy helper with confetti
  const copyToClipboard = async (text: string, key: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedKey(key);
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#007782", "#00a8b5", "#10b981", "#ffffff"],
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

  // Auto-detect language if user pastes common phrases
  const handleBuyerMessageChange = (text: string) => {
    setBuyerMessage(text);
    setAiCustomResponse(null);
    const lower = text.toLowerCase();
    if (
      lower.includes("bonjour") ||
      lower.includes("svp") ||
      lower.includes("merci") ||
      lower.includes("prix") ||
      lower.includes("combien") ||
      lower.includes("dispo")
    ) {
      setSelectedLang("fr");
    } else if (
      lower.includes("hola") ||
      lower.includes("buenas") ||
      lower.includes("rebaja") ||
      lower.includes("envio") ||
      lower.includes("precio") ||
      lower.includes("cuanto")
    ) {
      setSelectedLang("es");
    } else if (
      lower.includes("ciao") ||
      lower.includes("buongiorno") ||
      lower.includes("prezzo") ||
      lower.includes("sconto") ||
      lower.includes("disponibile")
    ) {
      setSelectedLang("it");
    } else if (
      lower.includes("olá") ||
      lower.includes("boa tarde") ||
      lower.includes("mínimo") ||
      lower.includes("aceita")
    ) {
      setSelectedLang("pt");
    }
  };

  // Generate dynamic response based on Intent and Target Language
  const generateDynamicReply = (lang: TargetLang, intent: ActionIntent): { reply: string; translationPt: string } => {
    const price = counterPriceInput || "20";

    if (intent === "accept") {
      switch (lang) {
        case "fr":
          return {
            reply: `Bonjour ! J'accepte votre offre avec grand plaisir. Vous pouvez finaliser la commande dans l'application Vinted et je vous prépare le colis très soigneusement pour un envoi sous 24h ! Merci beaucoup 😊📦`,
            translationPt: `Aceito a tua oferta com todo o gosto. Podes avançar com a compra na app e trato do envio super bem protegido em 24h! Muito obrigado 😊📦`,
          };
        case "es":
          return {
            reply: `¡Hola! Acepto tu oferta con mucho gusto. Puedes proceder con la compra en la app de Vinted y me encargo de prepararte el paquete súper bien protegido en las próximas 24 horas. ¡Muchas gracias! 😊📦`,
            translationPt: `Aceito a tua oferta com muito gosto. Podes avançar com a compra na app da Vinted e trato de te preparar o pacote super bem protegido nas próximas 24 horas. Muito obrigado! 😊📦`,
          };
        case "it":
          return {
            reply: `Ciao! Accetto la tua offerta con molto piacere. Puoi procedere con l'acquisto nell'app e ti preparo il pacco super protetto per la spedizione entro le prossime 24 ore. Grazie mille! 😊📦`,
            translationPt: `Aceito a tua oferta com muito prazer. Podes proceder à compra e preparo o pacote super protegido para envio em 24h. Obrigado! 😊📦`,
          };
        case "pt":
        default:
          return {
            reply: `Olá! Aceito a tua oferta com todo o gosto. Podes avançar com a compra aqui na app que trato de embalar o artigo com todo o cuidado e envio em 24h! Muito obrigado 😊📦`,
            translationPt: `Versão direta em Português`,
          };
      }
    }

    if (intent === "counter") {
      switch (lang) {
        case "fr":
          return {
            reply: `Bonjour ! Merci beaucoup pour votre intérêt. Votre offre est malheureusement un peu trop basse par rapport à la valeur et à l'état de l'article. Mon dernier prix pour valider la vente aujourd'hui est de ${price}€. Si cela vous convient, envoyez-moi l'offre dans l'application et je vous expédie le colis dès demain ! Bonne journée 😊📦`,
            translationPt: `Agradeço o interesse mas a oferta fica baixa. O meu preço mínimo para fechar hoje é ${price}€. Se concordares, envia a oferta e envio amanhã!`,
          };
        case "es":
          return {
            reply: `¡Hola! Muchas gracias por tu interés y por tu oferta. Lamentablemente queda demasiado baja para el estado del artículo. Mi precio mínimo definitivo para cerrar el trato hoy es de ${price}€. Si te parece bien, haz la contraoferta en la app y te lo envío mañana mismo bien protegido. ¡Un saludo! 😊📦`,
            translationPt: `Agradeço o interesse, mas fica muito baixa para o estado do artigo. O meu mínimo para fechar hoje é ${price}€. Se te parecer bem, envia a oferta e envio amanhã!`,
          };
        case "it":
          return {
            reply: `Ciao! Grazie mille per l'interesse. Purtroppo l'offerta è un po' troppo bassa per le condizioni dell'articolo. Il mio prezzo minimo per concludere oggi è di ${price}€. Se per te va bene, invia l'offerta nell'app e spedirò il pacco domani mattina! Buona giornata 😊📦`,
            translationPt: `Obrigado pelo interesse. A oferta é muito baixa. O meu preço mínimo para fechar hoje é ${price}€. Se te convier, envia a oferta e envio amanhã!`,
          };
        case "pt":
        default:
          return {
            reply: `Olá! Muito obrigado pelo interesse. Infelizmente esse valor fica muito abaixo do valor do artigo. O preço mínimo absoluto que consigo fazer para fecharmos já negócio é ${price}€. Se aceitares, envia a proposta pela app e trato do envio logo a seguir! 😊📦`,
            translationPt: `Versão direta em Português`,
          };
      }
    }

    if (intent === "explain") {
      switch (lang) {
        case "fr":
          return {
            reply: `Bonjour ! L'article est exactement dans l'état décrit et visible sur les photos : 100% authentique, impeccable et sans aucun défaut. Les mesures précises sont également indiquées dans l'annonce. Il est soigneusement rangé et prêt à être envoyé. N'hésitez pas si vous avez d'autres questions ! ✨`,
            translationPt: `O artigo está exatamente no estado descrito e nas fotos: 100% autêntico, impecável e sem defeitos. Medidas indicadas no anúncio. Pronto para envio!`,
          };
        case "es":
          return {
            reply: `¡Hola! El artículo está exactamente en el estado descrito y visible en las fotos: 100% auténtico, impecable y sin ningún defecto ni marca. Las medidas exactas también están detalladas en el anuncio. Está guardado y listo para enviar. ¡Cualquier duda aquí estoy! ✨`,
            translationPt: `O artigo está exatamente conforme descrito e nas fotos: 100% autêntico, impecável e sem defeitos. Medidas no anúncio. Pronto a enviar!`,
          };
        case "it":
          return {
            reply: `Ciao! L'articolo è esattamente nelle condizioni descritte e mostrate nelle foto: 100% autentico, impeccabile e senza difetti. Le misure esatte sono specificate nella descrizione. È pronto per essere spedito con cura. A disposizione per qualsiasi domanda! ✨`,
            translationPt: `O artigo está nas condições descritas e fotos: 100% autêntico, impecável e sem defeitos. Medidas na descrição. Pronto para envio!`,
          };
        case "pt":
        default:
          return {
            reply: `Olá! O artigo está rigorosamente no estado descrito e fotografado no anúncio: 100% autêntico, impecável e sem marcas ou defeitos. As medidas detalhadas também estão na descrição. Está devidamente guardado e pronto para envio! ✨`,
            translationPt: `Versão direta em Português`,
          };
      }
    }

    // Shipping intent
    switch (lang) {
      case "fr":
        return {
          reply: `Bonjour ! Oui, je vous confirme que je prépare et dépose le colis sous 24h (le jour même ou le lendemain ouvré). Il sera emballé de façon ultra soignée et protégée. Vous recevrez immédiatement la notification de suivi dès le dépôt ! 📦⚡`,
          translationPt: `Sim, confirmo que preparo e envio o pacote em 24h (no próprio dia ou no dia útil seguinte) super bem protegido. Receberás logo o rastreio!`,
        };
      case "es":
        return {
          reply: `¡Hola! Sí, te confirmo que preparo y deposito el paquete en menos de 24 horas (el mismo día o el siguiente laborable). Irá súper bien embalado y protegido. ¡Recibirás el código de seguimiento de inmediato! 📦⚡`,
          translationPt: `Sim, confirmo que envio o pacote em menos de 24h muito bem embalado e protegido. Receberás logo o código de seguimento!`,
        };
      case "it":
        return {
          reply: `Ciao! Sì, ti confermo che preparo e spedisco il pacco entro 24 ore (in giornata o il giorno lavorativo successivo). Sarà imballato con estrema cura. Riceverai subito il codice di tracciamento! 📦⚡`,
          translationPt: `Sim, confirmo que preparo e envio em 24h embalado com extremo cuidado. Receberás logo o código de rastreamento!`,
        };
      case "pt":
      default:
        return {
          reply: `Olá! Sim, confirmo que preparo e envio a encomenda nas próximas 24 horas (no próprio dia ou dia útil seguinte), super bem embalada e protegida. Assim que der entrada no ponto recebes logo a notificação de rastreio! 📦⚡`,
          translationPt: `Versão direta em Português`,
        };
    }
  };

  const dynamicResult = generateDynamicReply(selectedLang, actionIntent);
  const currentOutputText = aiCustomResponse || dynamicResult.reply;

  // AI Assistant Custom Generator
  const handleGenerateAiResponse = async () => {
    if (!buyerMessage.trim()) return;
    setIsAiLoading(true);
    setAiCustomResponse(null);

    try {
      const intentNames: Record<ActionIntent, string> = {
        accept: "Aceitar a oferta com simpatia e confirmar envio em 24h.",
        counter: `Recusar educadamente a oferta baixa e propor contraproposta firme de ${counterPriceInput || "20"}€ com envio rápido em 24h.`,
        explain: "Explicar que o artigo está exatamente conforme fotos e descrição, 100% autêntico e impecável.",
        shipping: "Garantir que o envio é feito nas próximas 24h com embalagem reforçada.",
      };

      const langMap: Record<TargetLang, string> = {
        fr: "Francês (França/Bélgica)",
        es: "Espanhol (Espanha)",
        it: "Italiano (Itália)",
        pt: "Português",
      };

      const prompt = `És o melhor negociador de vendas na Vinted.
O comprador enviou esta mensagem:
"${buyerMessage}"

A língua alvo do comprador é: ${langMap[selectedLang]}.
O vendedor quer responder com a seguinte intenção: ${intentNames[actionIntent]}.

Instrução: Gera uma resposta persuasiva, impecável e cordial na língua alvo (${langMap[selectedLang]}), pronta a colar no chat da Vinted com emojis simpáticos e apropriados. Devolve APENAS o texto da mensagem a enviar (sem comentários ou aspas adicionais).`;

      const finalKey = apiKey?.trim() || "";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${finalKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!res.ok) {
        throw new Error("Falha na chamada à IA. Verifica a tua chave API nas Definições.");
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (rawText) {
        setAiCustomResponse(rawText);
        try {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7 },
            colors: ["#007782", "#00a8b5", "#10b981"],
          });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      alert(err.message || "Erro ao gerar resposta com IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Scenario Texts for Cacifo and Review
  const shippedTexts: Record<TargetLang, string> = {
    pt: `Olá! A tua encomenda já foi depositada com sucesso no ${courier}. O pacote vai muito bem protegido e acondicionado. Já deves conseguir acompanhar o estado do envio aqui no rastreio da Vinted. Muito obrigado pela compra! 📦✨`,
    es: `¡Hola! Tu paquete ya ha sido depositado correctamente en el ${courier}. Va súper bien embalado y protegido. Ya puedes comprobar el estado del envío directamente en el seguimiento de la app de Vinted. ¡Muchas gracias por la compra! 📦✨`,
    fr: `Bonjour ! Votre colis a bien été déposé au point ${courier}. Il est soigneusement emballé et bien protégé. Le suivi de livraison est désormais actif directement dans l'application Vinted. Merci beaucoup pour votre achat ! 📦✨`,
    it: `Ciao! Il tuo pacco è stato depositato con successo presso ${courier}. È imballato con estrema cura e protetto. Puoi già verificare lo stato della spedizione direttamente nell'app Vinted. Grazie mille per l'acquisto! 📦✨`,
  };

  const reviewTexts: Record<TargetLang, string> = {
    pt: `Olá! Vi que a tua encomenda já foi entregue com sucesso. Espero que tenhas gostado muito do artigo e que corresponda às tuas expectativas! Se correu tudo bem, agradecer-te-ia imenso se pudesses deixar uma avaliação de 5 estrelas aqui na Vinted. Ajuda imenso o meu perfil! Muito obrigado e boas compras! ⭐⭐⭐⭐⭐`,
    es: `¡Hola! He visto que tu paquete ya ha sido entregado con éxito. ¡Espero que te encante el artículo y que todo esté perfecto! Si estás satisfecho(a), te agradecería de corazón que me dejes una valoración de 5 estrellas en Vinted. ¡Ayuda muchísimo a mi perfil! ¡Muchas gracias y hasta la próxima! ⭐⭐⭐⭐⭐`,
    fr: `Bonjour ! J'ai vu que votre commande a bien été livrée. J'espère que l'article vous plaît et correspond parfaitement à vos attentes ! Si tout s'est bien passé, ce serait très gentil de me laisser un avis 5 étoiles sur Vinted. Cela m'aide énormément ! Merci beaucoup et bonne journée ! ⭐⭐⭐⭐⭐`,
    it: `Ciao! Ho visto che il tuo ordine è stato consegnato con successo. Spero che l'articolo ti piaccia e sia di tuo gradimento! Se è andato tutto bene, ti sarei immensamente grato/a se potessi lasciare una recensione a 5 stelle su Vinted. Aiuta moltissimo il mio profilo! Grazie mille e a presto! ⭐⭐⭐⭐⭐`,
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d2226] via-dark-card to-dark-surface border border-vinted-500/30 rounded-2xl p-3.5">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-vinted-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Assistente de Negociação no Chat
          </h2>
        </div>
        <p className="text-[11px] text-dark-muted leading-tight">
          Cola a mensagem do comprador em <strong>Francês 🇫🇷</strong>,{" "}
          <strong>Espanhol 🇪🇸</strong>, <strong>Italiano 🇮🇹</strong> ou{" "}
          <strong>Português 🇵🇹</strong> e responde com 1 toque.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-dark-card border border-dark-border p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab("quick_reply")}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "quick_reply"
              ? "bg-vinted-500 text-white shadow-teal-glow"
              : "text-dark-muted hover:text-white"
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>Tradutor Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("shipped_locker")}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "shipped_locker"
              ? "bg-vinted-500 text-white shadow-teal-glow"
              : "text-dark-muted hover:text-white"
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Avisar Envio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("request_review")}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "request_review"
              ? "bg-vinted-500 text-white shadow-teal-glow"
              : "text-dark-muted hover:text-white"
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Pedir 5 Estrelas</span>
        </button>
      </div>

      {/* TAB 1: TRADUTOR & RESPOSTA RÁPIDA A MENSAGEM */}
      {activeTab === "quick_reply" && (
        <div className="space-y-3.5">
          {/* Card: Paste buyer message */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Mensagem Recebida do Comprador</span>
              </label>
              <span className="text-[10px] text-vinted-400 font-semibold">
                Deteção Automática
              </span>
            </div>

            <textarea
              data-selectable="true"
              value={buyerMessage}
              onChange={(e) => handleBuyerMessageChange(e.target.value)}
              placeholder="Cola aqui a mensagem da Vinted (ex: 'Bonjour, vous pouvez faire à 18€?', 'Hola me lo dejas en 15€?', 'Ciao è disponibile?')..."
              rows={2}
              className="w-full bg-dark-surface border border-dark-border rounded-xl p-3 text-xs text-white placeholder:text-dark-muted/60 focus:border-vinted-500 focus:outline-none resize-none leading-relaxed"
            />

            {/* Target Language Selector */}
            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1.5">
                Responder em que língua?
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        setSelectedLang(lang.id);
                        setAiCustomResponse(null);
                      }}
                      className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                        isSelected
                          ? "bg-vinted-500/20 border-vinted-500 text-white shadow-teal-glow"
                          : "bg-dark-surface border-dark-border text-slate-300 hover:text-white"
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span className="text-[10px] truncate">{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Intent Selector */}
            <div>
              <label className="text-[10px] text-dark-muted uppercase font-bold block mb-1.5">
                O que queres responder?
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActionIntent("accept");
                    setAiCustomResponse(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    actionIntent === "accept"
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-dark-surface border-dark-border text-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Aceitar Oferta</span>
                  </div>
                  <div className="text-[9px] text-dark-muted mt-0.5">
                    Concordar e pedir compra
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionIntent("counter");
                    setAiCustomResponse(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    actionIntent === "counter"
                      ? "bg-amber-950/40 border-amber-500 text-amber-300 font-bold"
                      : "bg-dark-surface border-dark-border text-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contraproposta</span>
                  </div>
                  <div className="text-[9px] text-dark-muted mt-0.5">
                    Propor preço mínimo
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionIntent("explain");
                    setAiCustomResponse(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    actionIntent === "explain"
                      ? "bg-vinted-500/20 border-vinted-500 text-vinted-300 font-bold"
                      : "bg-dark-surface border-dark-border text-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-vinted-400" />
                    <span>Explicar Estado</span>
                  </div>
                  <div className="text-[9px] text-dark-muted mt-0.5">
                    Confirmar que está impecável
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionIntent("shipping");
                    setAiCustomResponse(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    actionIntent === "shipping"
                      ? "bg-vinted-500/20 border-vinted-500 text-vinted-300 font-bold"
                      : "bg-dark-surface border-dark-border text-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Envio Rápido</span>
                  </div>
                  <div className="text-[9px] text-dark-muted mt-0.5">
                    Garantir saída em 24h
                  </div>
                </button>
              </div>
            </div>

            {/* If Counter Offer: Price Input */}
            {actionIntent === "counter" && (
              <div className="bg-dark-surface/60 border border-dark-border/80 rounded-xl p-2.5 flex items-center justify-between gap-3 animate-in fade-in">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Valor da Contraproposta:
                  </span>
                  <span className="text-[10px] text-dark-muted">
                    Preço mínimo que aceitas
                  </span>
                </div>
                <div className="relative w-28">
                  <input
                    type="number"
                    value={counterPriceInput}
                    onChange={(e) => {
                      setCounterPriceInput(e.target.value);
                      setAiCustomResponse(null);
                    }}
                    className="w-full bg-dark-card border border-amber-500/50 rounded-lg px-3 py-1.5 text-base font-black text-white font-mono focus:outline-none"
                    placeholder="20"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                    €
                  </span>
                </div>
              </div>
            )}

            {/* Optional AI Polish button if buyer message is provided */}
            {buyerMessage.trim() && (
              <button
                type="button"
                disabled={isAiLoading}
                onClick={handleGenerateAiResponse}
                className="w-full py-2.5 px-3 rounded-xl bg-dark-surface hover:bg-dark-cardHover border border-vinted-500/40 text-vinted-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-vinted-400" />
                    <span>A personalizar com Gemini IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-vinted-400" />
                    <span>Personalizar com IA para esta mensagem</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* GENERATED TRANSLATED RESPONSE CARD */}
          <div className="bg-dark-card border-2 border-vinted-500/60 rounded-3xl p-4 space-y-3 shadow-teal-glow animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="text-base">
                  {LANGUAGES.find((l) => l.id === selectedLang)?.flag}
                </span>
                <span>
                  Resposta Pronta em{" "}
                  {LANGUAGES.find((l) => l.id === selectedLang)?.label}
                </span>
              </span>
              <span className="text-[10px] text-vinted-300 font-mono">
                {currentOutputText.length} carateres
              </span>
            </div>

            {/* The Text to Send */}
            <div
              data-selectable="true"
              className="bg-dark-surface border border-dark-border/80 rounded-2xl p-3.5 text-xs text-white leading-relaxed select-text font-sans"
            >
              {currentOutputText}
            </div>

            {/* Meaning in Portuguese for user peace of mind */}
            <div className="bg-dark-surface/50 border border-dark-border/50 rounded-xl px-3 py-2 text-[10px] text-dark-muted">
              <strong className="text-slate-300 block mb-0.5">
                Significado em Português:
              </strong>
              {dynamicResult.translationPt}
            </div>

            {/* Primary 1-Touch Copy Button */}
            <button
              type="button"
              onClick={() => copyToClipboard(currentOutputText, "dynamic_reply")}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98] ${
                copiedKey === "dynamic_reply"
                  ? "bg-emerald-600 text-white shadow-emerald-950/40"
                  : "bg-gradient-to-r from-vinted-500 to-vinted-accent text-white shadow-teal-glow hover:brightness-110"
              }`}
            >
              {copiedKey === "dynamic_reply" ? (
                <>
                  <Check className="w-4 h-4 stroke-[3px]" />
                  <span>Resposta Copiada! Pronto a Colar na Vinted</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Resposta com 1 Toque</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: AVISAR ENVIO CACIFO / PONTO DE RECOLHA */}
      {activeTab === "shipped_locker" && (
        <div className="space-y-3">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Avisar Envio no Cacifo / Ponto de Recolha
            </h3>
            <p className="text-[11px] text-dark-muted">
              Seleciona a transportadora e copia o aviso no idioma do teu comprador:
            </p>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
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

          <div className="space-y-2.5">
            <ResponseCard
              flag="🇵🇹"
              langName="Português"
              text={shippedTexts.pt}
              onCopy={() => copyToClipboard(shippedTexts.pt, "ship_pt")}
              isCopied={copiedKey === "ship_pt"}
            />
            <ResponseCard
              flag="🇪🇸"
              langName="Espanhol (Espanha)"
              text={shippedTexts.es}
              onCopy={() => copyToClipboard(shippedTexts.es, "ship_es")}
              isCopied={copiedKey === "ship_es"}
            />
            <ResponseCard
              flag="🇫🇷"
              langName="Francês (França/Bélgica)"
              text={shippedTexts.fr}
              onCopy={() => copyToClipboard(shippedTexts.fr, "ship_fr")}
              isCopied={copiedKey === "ship_fr"}
            />
            <ResponseCard
              flag="🇮🇹"
              langName="Italiano (Itália)"
              text={shippedTexts.it}
              onCopy={() => copyToClipboard(shippedTexts.it, "ship_it")}
              isCopied={copiedKey === "ship_it"}
            />
          </div>
        </div>
      )}

      {/* TAB 3: PEDIR AVALIAÇÃO DE 5 ESTRELAS */}
      {activeTab === "request_review" && (
        <div className="space-y-3">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-3.5 space-y-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Pedir Avaliação de 5 Estrelas (Pós-Entrega)</span>
            </h3>
            <p className="text-[11px] text-dark-muted">
              Mensagens amigáveis para enviar quando o artigo chegar, garantindo que o comprador deixa 5 estrelas no teu perfil.
            </p>
          </div>

          <div className="space-y-2.5">
            <ResponseCard
              flag="🇵🇹"
              langName="Português"
              text={reviewTexts.pt}
              onCopy={() => copyToClipboard(reviewTexts.pt, "rev_pt")}
              isCopied={copiedKey === "rev_pt"}
            />
            <ResponseCard
              flag="🇪🇸"
              langName="Espanhol"
              text={reviewTexts.es}
              onCopy={() => copyToClipboard(reviewTexts.es, "rev_es")}
              isCopied={copiedKey === "rev_es"}
            />
            <ResponseCard
              flag="🇫🇷"
              langName="Francês"
              text={reviewTexts.fr}
              onCopy={() => copyToClipboard(reviewTexts.fr, "rev_fr")}
              isCopied={copiedKey === "rev_fr"}
            />
            <ResponseCard
              flag="🇮🇹"
              langName="Italiano"
              text={reviewTexts.it}
              onCopy={() => copyToClipboard(reviewTexts.it, "rev_it")}
              isCopied={copiedKey === "rev_it"}
            />
          </div>
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

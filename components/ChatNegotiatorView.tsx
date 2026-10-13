"use client";

import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Copy,
  Check,
  Zap,
  PackageCheck,
  Star,
  Sparkles,
  Bot,
  Loader2,
  DollarSign,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  Languages,
  Clock,
  HeartHandshake,
  SendHorizontal,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ChatNegotiatorViewProps {
  apiKey?: string;
  selectedModel?: string;
}

export type BuyerLang = "fr" | "es" | "it" | "en" | "pt";
export type ResponseIntent =
  | "accept"
  | "counter"
  | "guarantee_10_10"
  | "decline_politely";

export type TemplateLang = "pt" | "fr" | "es";

interface LangOption {
  id: BuyerLang;
  flag: string;
  label: string;
  country: string;
}

const BUYER_LANGUAGES: LangOption[] = [
  { id: "fr", flag: "🇫🇷", label: "Francês", country: "França / Bélgica" },
  { id: "es", flag: "🇪🇸", label: "Espanhol", country: "Espanha" },
  { id: "it", flag: "🇮🇹", label: "Italiano", country: "Itália" },
  { id: "en", flag: "🇬🇧", label: "Inglês", country: "Internacional" },
  { id: "pt", flag: "🇵🇹", label: "Português", country: "Portugal" },
];

export function ChatNegotiatorView({
  apiKey,
  selectedModel = "gemini-2.5-flash",
}: ChatNegotiatorViewProps) {
  // ==========================================
  // FERRAMENTA 1: TRADUTOR & GERADOR IA (TOPO)
  // ==========================================
  const [buyerMessage, setBuyerMessage] = useState<string>("");
  const [selectedLang, setSelectedLang] = useState<BuyerLang>("fr");
  const [manualLangOverride, setManualLangOverride] = useState<boolean>(false);
  const [actionIntent, setActionIntent] = useState<ResponseIntent>("counter");
  const [counterPriceInput, setCounterPriceInput] = useState<string>("20");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiCustomResponse, setAiCustomResponse] = useState<string | null>(null);
  const [aiTranslationPt, setAiTranslationPt] = useState<string | null>(null);

  // ==========================================
  // FERRAMENTA 2: TEMPLATES RÁPIDOS (EM BAIXO)
  // ==========================================
  const [templateLang, setTemplateLang] = useState<TemplateLang>("pt");

  // Feedback de cópia
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Helper de cópia com confetti
  const copyToClipboard = async (text: string, key: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedKey(key);
      try {
        confetti({
          particleCount: 36,
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

  // Deteção inteligente de idioma a partir do texto
  const detectLanguage = (text: string): BuyerLang => {
    const lower = text.toLowerCase().trim();
    if (!lower) return "fr";

    const frCues = [
      "bonjour", "salut", "svp", "merci", "prix", "dernier", "combien", "pouvez",
      "faire", "dispo", "disponible", "envoi", "frais", "relais", "colis", "possible",
      "taille", "photo", "baisse", "offre", "cdlt", "cordialement", "acheter", "bonsoir"
    ];
    const esCues = [
      "hola", "buenas", "cuanto", "precio", "rebaja", "dejas", "haces", "envio",
      "disponible", "gracias", "ultimo", "negociable", "talla", "fotos", "oferta",
      "acepta", "quedaria", "correos", "punto", "comprar"
    ];
    const itCues = [
      "ciao", "buongiorno", "buonasera", "quanto", "prezzo", "sconto", "disponibile",
      "grazie", "spedizione", "accetti", "trattabile", "taglia", "foto", "offerta",
      "puoi", "fare", "lasci"
    ];
    const enCues = [
      "hello", "hi", "hey", "price", "lowest", "best", "available", "shipping",
      "offer", "accept", "discount", "condition", "bundle", "size", "thanks", "thank you",
      "would you", "can you", "still available"
    ];
    const ptCues = [
      "olá", "ola", "boas", "bom dia", "boa tarde", "preço", "preco", "mínimo",
      "minimo", "faz", "fazes", "envio", "disponível", "disponivel", "obrigado",
      "aceita", "proposta", "consegues"
    ];

    let frScore = 0, esScore = 0, itScore = 0, enScore = 0, ptScore = 0;

    for (const w of frCues) if (lower.includes(w)) frScore += 2;
    for (const w of esCues) if (lower.includes(w)) esScore += 2;
    for (const w of itCues) if (lower.includes(w)) itScore += 2;
    for (const w of enCues) if (lower.includes(w)) enScore += 2;
    for (const w of ptCues) if (lower.includes(w)) ptScore += 2;

    if (/[éèêàçù]/.test(lower)) frScore += 1;
    if (/[¿¡ñ]/.test(lower)) esScore += 3;
    if (/(\bè\b|\bha\b|\bsono\b|\bper\b)/.test(lower)) itScore += 2;
    if (/(\bthe\b|\bis\b|\bfor\b|\byou\b|\bit\b)/.test(lower)) enScore += 2;
    if (/[ãõáéíóú]/.test(lower)) ptScore += 1;

    const scores = [
      { lang: "fr" as const, score: frScore },
      { lang: "es" as const, score: esScore },
      { lang: "it" as const, score: itScore },
      { lang: "en" as const, score: enScore },
      { lang: "pt" as const, score: ptScore },
    ];

    scores.sort((a, b) => b.score - a.score);
    return scores[0].score > 0 ? scores[0].lang : "fr";
  };

  // Atualização da mensagem com auto-deteção se o utilizador não tiver forçado manualmente
  const handleBuyerMessageChange = (text: string) => {
    setBuyerMessage(text);
    setAiCustomResponse(null);
    setAiTranslationPt(null);

    if (!manualLangOverride && text.trim().length >= 3) {
      const autoLang = detectLanguage(text);
      setSelectedLang(autoLang);
    }
  };

  // Tradução imediata com heurísticas do mercado Vinted
  const instantTranslation = useMemo(() => {
    if (aiTranslationPt) return aiTranslationPt;
    const trimmed = buyerMessage.trim();
    if (!trimmed) {
      return "Cola uma mensagem acima para ver a tradução instantânea em Português.";
    }

    const lower = trimmed.toLowerCase();
    const priceMatch = trimmed.match(/(\d+(?:[.,]\d+)?)\s*(?:€|eur|euros|\$)?/i);
    const foundPrice = priceMatch ? priceMatch[1] : null;

    const isAskingPrice =
      lower.includes("dernier prix") ||
      lower.includes("último precio") ||
      lower.includes("ultimo prezzo") ||
      lower.includes("best price") ||
      lower.includes("lowest") ||
      lower.includes("mínimo") ||
      lower.includes("minimo") ||
      lower.includes("combien") ||
      lower.includes("cuanto");

    const isAskingAvail =
      lower.includes("dispo") ||
      lower.includes("disponible") ||
      lower.includes("available");

    const isAskingShipping =
      lower.includes("envoi") ||
      lower.includes("envio") ||
      lower.includes("spedizione") ||
      lower.includes("shipping") ||
      lower.includes("relais") ||
      lower.includes("inpost");

    const isAskingCondition =
      lower.includes("état") ||
      lower.includes("etat") ||
      lower.includes("estado") ||
      lower.includes("condizioni") ||
      lower.includes("condition") ||
      lower.includes("défaut") ||
      lower.includes("defecto") ||
      lower.includes("difetti") ||
      lower.includes("flaw");

    if (
      foundPrice &&
      (lower.includes("faire") ||
        lower.includes("dejas") ||
        lower.includes("lasci") ||
        lower.includes("take") ||
        lower.includes("aceita") ||
        lower.includes("svp") ||
        lower.includes("€") ||
        lower.includes("eur") ||
        lower.includes("prix"))
    ) {
      return `💰 Proposta de Preço: O comprador está a oferecer ou a perguntar se aceitas fechar por ${foundPrice}€.`;
    }

    if (isAskingPrice) {
      return "🏷️ Negociação: O comprador quer saber qual é o teu preço mínimo / último preço para fechar.";
    }

    if (isAskingAvail) {
      return "✅ Disponibilidade: O comprador está a perguntar se o artigo ainda está disponível para envio.";
    }

    if (isAskingShipping) {
      return "📦 Envio / Prazos: O comprador está a perguntar sobre os portes, transportadora (InPost / Mondial Relay / CTT) ou data de envio.";
    }

    if (isAskingCondition) {
      return "🔍 Estado do Artigo: O comprador quer confirmar o estado 10/10, eventuais marcas de uso ou defeitos.";
    }

    // Heurística por idioma
    switch (selectedLang) {
      case "fr":
        return `🇫🇷 Mensagem em Francês: "${trimmed}". O comprador está em contacto para negociar ou esclarecer dúvidas.`;
      case "es":
        return `🇪🇸 Mensagem em Espanhol: "${trimmed}". O comprador em Espanha enviou esta mensagem sobre o artigo.`;
      case "it":
        return `🇮🇹 Mensagem em Italiano: "${trimmed}". O comprador em Itália enviou esta dúvida.`;
      case "en":
        return `🇬🇧 Mensagem em Inglês: "${trimmed}". O comprador enviou esta questão sobre o artigo.`;
      case "pt":
      default:
        return `🇵🇹 Mensagem em Português: "${trimmed}".`;
    }
  }, [buyerMessage, selectedLang, aiTranslationPt]);

  // Templates inteligentes multilingues de resposta (Fallback robusto e instantâneo)
  const getSmartReply = (
    lang: BuyerLang,
    intent: ResponseIntent
  ): { reply: string; translationPt: string } => {
    const price = counterPriceInput || "20";

    if (intent === "accept") {
      switch (lang) {
        case "fr":
          return {
            reply: `Bonjour ! J'accepte votre offre avec grand plaisir 😊 Vous pouvez finaliser la commande directement dans l'application Vinted. Je vous prépare le colis avec le plus grand soin et je vous l'expédie sous 24h ! Merci beaucoup et très bonne journée ! 📦✨`,
            translationPt: `Aceito a tua oferta com muito gosto! Podes avançar com a compra na app. Trato de preparar o pacote com todo o carinho e envio nas próximas 24 horas! Muito obrigado!`,
          };
        case "es":
          return {
            reply: `¡Hola! Acepto tu oferta con mucho gusto 😊 Puedes proceder con la compra directamente en la app de Vinted. Te preparo el paquete súper bien protegido y te lo envío en menos de 24 horas. ¡Muchísimas gracias! 📦✨`,
            translationPt: `Aceito a tua oferta com muito gosto! Podes concluir a compra na app. Preparo o pacote super bem protegido e envio em 24h. Muito obrigado!`,
          };
        case "it":
          return {
            reply: `Ciao! Accetto la tua offerta con grande piacere 😊 Puoi procedere all'acquisto direttamente qui su Vinted. Ti preparo il pacco con estrema cura e lo spedisco entro 24 ore! Grazie mille! 📦✨`,
            translationPt: `Aceito a tua oferta com muito prazer! Podes avançar para a compra na app. Preparo o pacote com extremo cuidado e envio em 24h. Muito obrigado!`,
          };
        case "en":
          return {
            reply: `Hi! I'm happy to accept your offer 😊 Please feel free to complete the purchase through the Vinted app. I will pack it very carefully and ship it out within 24 hours! Thank you very much! 📦✨`,
            translationPt: `Aceito a tua oferta com muito gosto! Podes avançar com a compra na app. Embalo com muito cuidado e envio em 24h. Obrigado!`,
          };
        case "pt":
        default:
          return {
            reply: `Olá! Aceito a tua oferta com todo o gosto 😊 Podes avançar com a compra aqui na aplicação. Vou embalar o artigo com todo o carinho e proteção e envio nas próximas 24h! Muito obrigado! 📦✨`,
            translationPt: `Aceito a tua oferta com todo o gosto! Podes avançar com a compra na app. Embalo com proteção e envio em 24h!`,
          };
      }
    }

    if (intent === "counter") {
      switch (lang) {
        case "fr":
          return {
            reply: `Bonjour ! Merci beaucoup pour votre intérêt. Votre proposition est malheureusement un peu trop basse par rapport à la valeur et à l'état de l'article. Mon dernier prix pour valider la vente aujourd'hui est de ${price}€. Si cela vous convient, envoyez-moi l'offre dans l'application et je vous prépare le colis dès aujourd'hui ! Bonne journée 😊📦`,
            translationPt: `Obrigado pelo interesse. A proposta é um pouco baixa para o estado do artigo. O meu mínimo para fechar hoje é ${price}€. Se concordares, envia a proposta e preparo o pacote hoje!`,
          };
        case "es":
          return {
            reply: `¡Hola! Muchas gracias por tu interés y por tu oferta. Lamentablemente queda demasiado baja para el estado del artículo. Mi precio mínimo definitivo para cerrar el trato hoy es de ${price}€. Si te parece bien, hazme la contraoferta en la app y te lo envío mañana mismo bien protegido. ¡Un saludo! 😊📦`,
            translationPt: `Obrigado pelo interesse. Fica muito abaixo para o estado do artigo. O meu mínimo para fechar hoje é ${price}€. Se te servir, envia a contraoferta na app e envio amanhã!`,
          };
        case "it":
          return {
            reply: `Ciao! Grazie mille per l'interesse. Purtroppo l'offerta è un po' troppo bassa per le condizioni dell'articolo. Il mio prezzo minimo per concludere oggi è di ${price}€. Se per te va bene, fai pure l'offerta nell'app e spedirò il pacco domattina! Buona giornata 😊📦`,
            translationPt: `Obrigado pelo interesse. A oferta é baixa para o estado do artigo. O meu preço mínimo é ${price}€. Se concordares, faz a oferta e envio amanhã!`,
          };
        case "en":
          return {
            reply: `Hi! Thanks so much for your interest and offer. Unfortunately, that's a bit too low considering the great condition of the item. The best price I can do to close the deal today is ${price}€. If that works for you, please send the offer through the app and I'll ship it out tomorrow! Best regards 😊📦`,
            translationPt: `Obrigado pelo interesse. É um pouco baixo para o ótimo estado do artigo. O melhor que consigo fazer hoje é ${price}€. Se concordares, envia a oferta e envio amanhã!`,
          };
        case "pt":
        default:
          return {
            reply: `Olá! Muito obrigado pelo interesse. Infelizmente esse valor fica um pouco abaixo para o excelente estado do artigo. O meu preço mínimo definitivo para fechar hoje é ${price}€. Se concordares, envia a contraproposta pela app e trato do envio logo a seguir! 😊📦`,
            translationPt: `Obrigado pelo interesse. Fica abaixo para o estado do artigo. O meu mínimo é ${price}€. Se concordares, envia a proposta e trato do envio!`,
          };
      }
    }

    if (intent === "guarantee_10_10") {
      switch (lang) {
        case "fr":
          return {
            reply: `Bonjour ! Je vous confirme que l'article est dans un état 10/10 impeccable, exactement comme sur les photos, sans aucun défaut ni trace d'usure. Il est déjà soigneusement rangé et prêt à partir. Si vous commandez maintenant, je le dépose au point relais aujourd'hui même ! ⚡📦✨`,
            translationPt: `Confirmo que o artigo está 10/10 impecável, exatamente como nas fotos, sem defeitos. Já está embalado e se comprares agora deposito no ponto de recolha hoje mesmo! ⚡`,
          };
        case "es":
          return {
            reply: `¡Hola! Te confirmo que el artículo está en estado 10/10 impecable, exactamente tal como se ve en las fotos, sin defectos ni marcas de uso. Ya lo tengo perfectamente preparado y protegido. ¡Si compras ahora, te lo deposito en el punto de entrega hoy mismo! ⚡📦✨`,
            translationPt: `Confirmo que o artigo está 10/10 impecável, tal como nas fotos, sem marcas de uso. Está preparado e se comprares agora deposito no ponto de entrega hoje mesmo! ⚡`,
          };
        case "it":
          return {
            reply: `Ciao! Ti confermo che l'articolo è in condizioni 10/10 impeccabili, esattamente come mostrato nelle foto, privo di difetti o segni. È già imballato e protetto con cura. Se completi l'ordine adesso, lo porto al punto di spedizione oggi stesso! ⚡📦✨`,
            translationPt: `Confirmo que o artigo está 10/10 impecável, como nas fotos, sem marcas. Já está embalado e se comprares agora levo ao ponto de envio hoje mesmo! ⚡`,
          };
        case "en":
          return {
            reply: `Hi! I can confirm the item is in pristine 10/10 condition, exactly as shown in the pictures, with zero flaws or defects. It is already securely packed and protected. If you order now, I will drop it off at the parcel locker/drop point today! ⚡📦✨`,
            translationPt: `Confirmo que o artigo está 10/10 impecável, sem defeitos. Já está bem embalado e se comprares agora deixo no cacifo/ponto de entrega hoje mesmo! ⚡`,
          };
        case "pt":
        default:
          return {
            reply: `Olá! Confirmo que o artigo está em estado 10/10 rigorosamente impecável, tal como podes comprovar nas fotos, sem qualquer defeito ou marca. Já o tenho devidamente acondicionado e protegido. Se comprares agora, entrego no cacifo/posto hoje mesmo! ⚡📦✨`,
            translationPt: `Confirmo que o artigo está 10/10 impecável, sem marcas. Já está embalado e se comprares agora entrego no cacifo/posto hoje mesmo! ⚡`,
          };
      }
    }

    // decline_politely
    switch (lang) {
      case "fr":
        return {
          reply: `Bonjour ! Merci beaucoup pour votre offre et votre intérêt. Malheureusement, ce montant est trop éloigné de la valeur réelle de l'article, je ne peux donc pas l'accepter. Le prix affiché est déjà très juste pour son état. Je vous souhaite une excellente journée et de bonnes recherches sur Vinted ! 😊👋`,
          translationPt: `Muito obrigado pela proposta e interesse. Infelizmente esse valor fica muito longe do valor real, não posso aceitar. O preço anunciado já é muito justo. Boas compras!`,
        };
      case "es":
        return {
          reply: `¡Hola! Muchas gracias por tu interés y por enviar la oferta. Lamentablemente queda demasiado lejos del valor real del artículo, por lo que no puedo aceptarla. El precio publicado ya está muy ajustado a su excelente estado. ¡Muchas gracias y que tengas un buen día! 😊👋`,
          translationPt: `Muito obrigado pelo interesse e pela oferta. Infelizmente fica muito abaixo do valor real, não posso aceitar. O preço já está ajustado. Tenha um bom dia!`,
        };
      case "it":
        return {
          reply: `Ciao! Grazie mille per l'interesse e per la proposta. Purtroppo la cifra è troppo distante dal valore effettivo dell'articolo, quindi non posso accettarla. Il prezzo attuale è già molto corretto per le sue condizioni. Ti auguro una buona giornata e buoni acquisti su Vinted! 😊👋`,
          translationPt: `Obrigado pelo interesse e proposta. O valor fica muito distante do valor real, não posso aceitar. O preço atual já é correto. Boas compras!`,
        };
      case "en":
        return {
          reply: `Hi! Thank you very much for your interest and for the offer. Unfortunately, that amount is too far below the actual value of the item, so I won't be able to accept it. The current price is already very fair for its condition. Wishing you a great day and happy shopping on Vinted! 😊👋`,
          translationPt: `Muito obrigado pelo interesse e oferta. Infelizmente o valor fica muito abaixo do valor real, pelo que não consigo aceitar. O preço atual já é justo. Boas compras!`,
        };
      case "pt":
      default:
        return {
          reply: `Olá! Muito obrigado pelo interesse e pela proposta. Infelizmente esse valor fica bastante distante do valor real do artigo, pelo que não consigo aceitar. O preço atual já se encontra bastante ajustado ao excelente estado do mesmo. Desejo-te um ótimo dia e boas compras na Vinted! 😊👋`,
          translationPt: `Muito obrigado pelo interesse. Infelizmente o valor fica distante do valor real, pelo que não consigo aceitar. O preço atual já está justo. Boas compras!`,
        };
    }
  };

  const smartFallback = getSmartReply(selectedLang, actionIntent);
  const activeOutputText = aiCustomResponse || smartFallback.reply;
  const activeTranslationPt = aiTranslationPt || smartFallback.translationPt;

  // Chamada à API para gerar resposta personalizada com IA (Gemini)
  const handleGenerateAiResponse = async () => {
    if (!buyerMessage.trim()) return;
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerMessage: buyerMessage.trim(),
          intent: actionIntent,
          counterPrice: counterPriceInput || "20",
          targetLanguage: selectedLang,
          customApiKey: apiKey,
          customModel: selectedModel,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Erro na geração com IA");
      }

      const data = await res.json();
      if (data.response_text) {
        setAiCustomResponse(data.response_text);
        if (data.buyer_translation_pt) {
          setAiTranslationPt(data.buyer_translation_pt);
        }
        if (data.detected_language && !manualLangOverride) {
          setSelectedLang(data.detected_language as BuyerLang);
        }

        try {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.7 },
            colors: ["#007782", "#00a8b5", "#10b981"],
          });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      console.warn("Fallback para templates inteligentes:", err);
      // Mantém a resposta dos templates sem quebrar o fluxo do utilizador
    } finally {
      setIsAiLoading(false);
    }
  };

  // ==========================================
  // CONTEÚDOS DOS TEMPLATES RÁPIDOS (FERRAMENTA 2)
  // ==========================================
  const quickTemplates: Record<
    TemplateLang,
    {
      shipped: { title: string; text: string; ptExpl: string };
      thankYou: { title: string; text: string; ptExpl: string };
      review: { title: string; text: string; ptExpl: string };
    }
  > = {
    pt: {
      shipped: {
        title: "Já enviei no ponto de recolha / cacifo InPost / CTT!",
        text: `Olá! Já enviei a tua encomenda no ponto de recolha / cacifo InPost / CTT! O pacote foi super bem embalado e protegido. Já deves conseguir acompanhar o estado do envio diretamente aqui no rastreio da Vinted. Muito obrigado pela compra! 📦⚡`,
        ptExpl: "Mensagem direta em Português confirmando o depósito seguro.",
      },
      thankYou: {
        title: "Obrigado pela compra! Preparei tudo com plástico bolha e envio nas próximas 24h.",
        text: `Olá! Muito obrigado pela tua compra! Já preparei tudo com plástico bolha e embalagem reforçada. Envio nas próximas 24h para te chegar o mais depressa possível! 📦✨`,
        ptExpl: "Agradecimento imediato pós-compra e garantia de envio em 24h.",
      },
      review: {
        title: "Vi que a encomenda já chegou! Se estiver tudo impecável, podes confirmar na app e deixar feedback 5⭐?",
        text: `Olá! Vi que a encomenda já chegou! Se estiver tudo impecável, podes confirmar a receção na app e deixar um feedback de 5⭐? Ajuda imenso o meu perfil de vendedor. Muito obrigado e boas compras! ⭐⭐⭐⭐⭐`,
        ptExpl: "Pedido simpático de confirmação e avaliação de 5 estrelas.",
      },
    },
    fr: {
      shipped: {
        title: "Já enviei no ponto de recolha / cacifo InPost / CTT!",
        text: `Bonjour ! Votre colis a bien été déposé au point relais / casier InPost ! Il a été emballé avec le plus grand soin et très bien protégé. Vous pouvez d'ores et déjà suivre l'acheminement directement dans l'application Vinted. Merci beaucoup pour votre commande ! 📦⚡`,
        ptExpl: "Confirmação em Francês de que o pacote foi entregue no cacifo/relais com cuidado.",
      },
      thankYou: {
        title: "Obrigado pela compra! Preparei tudo com plástico bolha e envio nas próximas 24h.",
        text: `Bonjour ! Merci beaucoup pour votre achat ! J'ai soigneusement préparé l'article avec du papier bulle et un emballage renforcé. Je vous l'expédie sous 24h pour une réception rapide ! 📦✨`,
        ptExpl: "Agradecimento em Francês com garantia de plástico bolha e saída em 24h.",
      },
      review: {
        title: "Vi que a encomenda já chegou! Se estiver tudo impecável, podes confirmar na app e deixar feedback 5⭐?",
        text: `Bonjour ! J'ai vu que votre commande a bien été livrée ! Si tout est impeccable, pourriez-vous valider la réception sur Vinted et me laisser une évaluation 5⭐ ? Cela m'aide énormément. Merci infiniment et très bonne journée ! ⭐⭐⭐⭐⭐`,
        ptExpl: "Pedido cordial em Francês para validar a entrega e atribuir 5 estrelas.",
      },
    },
    es: {
      shipped: {
        title: "Já enviei no ponto de recolha / cacifo InPost / CTT!",
        text: `¡Hola! Tu paquete ya ha sido depositado correctamente en el punto de recogida / taquilla InPost / Correos. Va súper bien embalado y protegido. Ya puedes comprobar el estado del envío directamente en el seguimiento de Vinted. ¡Muchas gracias por la compra! 📦⚡`,
        ptExpl: "Confirmação em Espanhol de que o pacote já está depositado e protegido.",
      },
      thankYou: {
        title: "Obrigado pela compra! Preparei tudo com plástico bolha e envio nas próximas 24h.",
        text: `¡Hola! ¡Muchísimas gracias por tu compra! Ya he preparado el paquete con plástico de burbujas y embalaje reforzado. Te lo envío en las próximas 24 horas para que te llegue lo antes posible. 📦✨`,
        ptExpl: "Agradecimento em Espanhol com reforço de plástico bolha e envio em 24h.",
      },
      review: {
        title: "Vi que a encomenda já chegou! Se estiver tudo impecável, podes confirmar na app e deixar feedback 5⭐?",
        text: `¡Hola! He visto que el paquete ya ha sido entregado con éxito. Si todo está impecable, ¿podrías confirmar la recepción en la app y dejarme una valoración de 5⭐? ¡Ayuda muchísimo a mi perfil de vendedor! ¡Muchas gracias! ⭐⭐⭐⭐⭐`,
        ptExpl: "Pedido educado em Espanhol para fechar a compra e dar 5 estrelas.",
      },
    },
  };

  const currentQuick = quickTemplates[templateLang];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* ============================================================== */}
      {/* TOPO: INTRO HEADER                                            */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-[#0d2226] via-dark-card to-dark-surface border border-vinted-500/30 rounded-2xl p-3.5 shadow-teal-glow/20">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-vinted-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Negociador & Chat Vinted
            </h2>
          </div>
          <span className="text-[10px] bg-vinted-500/20 text-vinted-300 font-bold px-2 py-0.5 rounded-full border border-vinted-500/40">
            2-em-1 Pro
          </span>
        </div>
        <p className="text-[11px] text-dark-muted leading-relaxed">
          Traduz mensagens recebidas, gera respostas instantâneas na língua do comprador e copia avisos de envio com 1 toque.
        </p>
      </div>

      {/* ============================================================== */}
      {/* FERRAMENTA 1: TRADUTOR E GERADOR DE RESPOSTA COM IA (NO TOPO)  */}
      {/* ============================================================== */}
      <section className="bg-dark-card border border-dark-border rounded-3xl p-4 space-y-4 shadow-xl">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-dark-border/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-vinted-500/20 text-vinted-400 flex items-center justify-center border border-vinted-500/40">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Tradutor & Gerador IA</span>
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-dark-muted">
                Cola a mensagem do comprador em FR, ES, IT, EN ou PT
              </p>
            </div>
          </div>
          <span className="text-[10px] text-vinted-400 font-mono font-bold bg-dark-surface px-2 py-1 rounded-lg border border-dark-border">
            {BUYER_LANGUAGES.find((l) => l.id === selectedLang)?.flag}{" "}
            {BUYER_LANGUAGES.find((l) => l.id === selectedLang)?.label}
          </span>
        </div>

        {/* 1.1 Input Caixa de Texto da Mensagem */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Mensagem do Comprador</span>
            </label>
            {buyerMessage && (
              <button
                type="button"
                onClick={() => {
                  setBuyerMessage("");
                  setAiCustomResponse(null);
                  setAiTranslationPt(null);
                }}
                className="text-[10px] text-dark-muted hover:text-rose-400 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          <textarea
            data-selectable="true"
            value={buyerMessage}
            onChange={(e) => handleBuyerMessageChange(e.target.value)}
            placeholder="Cola aqui a mensagem da Vinted (ex: 'Bonjour, vous pouvez faire à 18€?', 'Hola me lo dejas en 15€?', 'Ciao è ancora disponibile?')..."
            rows={3}
            className="w-full bg-dark-surface border border-dark-border rounded-2xl p-3 text-xs text-white placeholder:text-dark-muted/60 focus:border-vinted-500 focus:outline-none resize-none leading-relaxed shadow-inner"
          />

          {/* Quick chip examples if empty */}
          {!buyerMessage && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[9px] text-dark-muted py-0.5">Testar:</span>
              <button
                type="button"
                onClick={() => handleBuyerMessageChange("Bonjour, vous pouvez faire à 15€ svp ?")}
                className="text-[9px] bg-dark-surface hover:bg-dark-surface/80 border border-dark-border text-slate-300 px-2 py-0.5 rounded-lg active:scale-95"
              >
                🇫🇷 15€ svp ?
              </button>
              <button
                type="button"
                onClick={() => handleBuyerMessageChange("Hola, me lo dejas en 18€ y me lo quedo hoy?")}
                className="text-[9px] bg-dark-surface hover:bg-dark-surface/80 border border-dark-border text-slate-300 px-2 py-0.5 rounded-lg active:scale-95"
              >
                🇪🇸 18€ hoy?
              </button>
              <button
                type="button"
                onClick={() => handleBuyerMessageChange("Ciao, è ancora disponibile? Spedisci subito?")}
                className="text-[9px] bg-dark-surface hover:bg-dark-surface/80 border border-dark-border text-slate-300 px-2 py-0.5 rounded-lg active:scale-95"
              >
                🇮🇹 È disponibile?
              </button>
              <button
                type="button"
                onClick={() => handleBuyerMessageChange("Hi! Would you accept 20€? What is the condition?")}
                className="text-[9px] bg-dark-surface hover:bg-dark-surface/80 border border-dark-border text-slate-300 px-2 py-0.5 rounded-lg active:scale-95"
              >
                🇬🇧 20€ condition?
              </button>
            </div>
          )}
        </div>

        {/* 1.2 Tradução Imediata para Português */}
        <div className="bg-gradient-to-br from-dark-surface to-dark-surface/70 border border-vinted-500/30 rounded-2xl p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-vinted-300 uppercase tracking-wider flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-vinted-400" />
              <span>Tradução Imediata para Português 🇵🇹</span>
            </span>
            <span className="text-[9px] text-dark-muted font-medium">
              {buyerMessage.trim() ? "Em tempo real" : "Aguardando mensagem"}
            </span>
          </div>
          <p
            data-selectable="true"
            className={`text-xs leading-relaxed select-text ${
              buyerMessage.trim() ? "text-slate-100 font-medium" : "text-dark-muted italic text-[11px]"
            }`}
          >
            {instantTranslation}
          </p>
        </div>

        {/* 1.3 Seletor Rápido de Língua do Comprador */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-dark-muted uppercase font-bold">
              Língua Alvo do Comprador
            </label>
            <span className="text-[9px] text-vinted-400">
              {manualLangOverride ? "Manual" : "Auto-detetado"}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {BUYER_LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang.id);
                    setManualLangOverride(true);
                    setAiCustomResponse(null);
                  }}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                    isSelected
                      ? "bg-vinted-500/25 border-vinted-500 text-white shadow-teal-glow"
                      : "bg-dark-surface border-dark-border text-slate-300 hover:text-white"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="text-[9px] truncate max-w-full">{lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1.4 Botões de Intenção de Resposta */}
        <div className="space-y-2">
          <label className="text-[10px] text-dark-muted uppercase font-bold block">
            Escolhe a Intenção da Resposta:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Intenção 1: Aceitar Oferta */}
            <button
              type="button"
              onClick={() => {
                setActionIntent("accept");
                setAiCustomResponse(null);
              }}
              className={`p-2.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                actionIntent === "accept"
                  ? "bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50"
                  : "bg-dark-surface border-dark-border text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    actionIntent === "accept" ? "text-emerald-400" : "text-emerald-500/70"
                  }`}
                />
                <span className="text-xs font-bold">Aceitar Oferta</span>
              </div>
              <span className="text-[9px] text-dark-muted mt-1">
                Concordar e pedir compra
              </span>
            </button>

            {/* Intenção 2: Contraproposta */}
            <button
              type="button"
              onClick={() => {
                setActionIntent("counter");
                setAiCustomResponse(null);
              }}
              className={`p-2.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                actionIntent === "counter"
                  ? "bg-amber-950/50 border-amber-500 text-amber-200 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50"
                  : "bg-dark-surface border-dark-border text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <DollarSign
                  className={`w-4 h-4 ${
                    actionIntent === "counter" ? "text-amber-400" : "text-amber-500/70"
                  }`}
                />
                <span className="text-xs font-bold">Contraproposta</span>
              </div>
              <span className="text-[9px] text-dark-muted mt-1">
                Propor preço mínimo em €
              </span>
            </button>

            {/* Intenção 3: Garantir Estado 10/10 e Envio Hoje */}
            <button
              type="button"
              onClick={() => {
                setActionIntent("guarantee_10_10");
                setAiCustomResponse(null);
              }}
              className={`p-2.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                actionIntent === "guarantee_10_10"
                  ? "bg-cyan-950/50 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50"
                  : "bg-dark-surface border-dark-border text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck
                  className={`w-4 h-4 ${
                    actionIntent === "guarantee_10_10" ? "text-cyan-400" : "text-cyan-500/70"
                  }`}
                />
                <span className="text-xs font-bold">Garantir 10/10 & Hoje</span>
              </div>
              <span className="text-[9px] text-dark-muted mt-1">
                Impecável + envio rápido
              </span>
            </button>

            {/* Intenção 4: Recusar Educadamente */}
            <button
              type="button"
              onClick={() => {
                setActionIntent("decline_politely");
                setAiCustomResponse(null);
              }}
              className={`p-2.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                actionIntent === "decline_politely"
                  ? "bg-rose-950/50 border-rose-500 text-rose-200 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50"
                  : "bg-dark-surface border-dark-border text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <XCircle
                  className={`w-4 h-4 ${
                    actionIntent === "decline_politely" ? "text-rose-400" : "text-rose-500/70"
                  }`}
                />
                <span className="text-xs font-bold">Recusar Educadamente</span>
              </div>
              <span className="text-[9px] text-dark-muted mt-1">
                Oferta muito baixa
              </span>
            </button>
          </div>
        </div>

        {/* Campo de Preço Mínimo para Contraproposta */}
        {actionIntent === "counter" && (
          <div className="bg-dark-surface border border-amber-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 animate-in fade-in">
            <div>
              <span className="text-xs font-bold text-white block">
                Valor Mínimo Aceite:
              </span>
              <span className="text-[10px] text-dark-muted">
                Preço que vais contrapropor na app
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
                className="w-full bg-dark-card border border-amber-500/60 rounded-xl px-3 py-2 text-base font-black text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                €
              </span>
            </div>
          </div>
        )}

        {/* Botão de personalização avançada com IA (Gemini) se houver texto */}
        {buyerMessage.trim().length > 0 && (
          <button
            type="button"
            disabled={isAiLoading}
            onClick={handleGenerateAiResponse}
            className="w-full py-2.5 px-3 rounded-2xl bg-dark-surface hover:bg-dark-cardHover border border-vinted-500/40 text-vinted-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
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

        {/* 1.5 Caixa de Resposta Gerada Pronta na Língua do Comprador */}
        <div className="bg-gradient-to-br from-dark-surface to-[#0d1e22] border-2 border-vinted-500/60 rounded-3xl p-4 space-y-3 shadow-teal-glow animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span className="text-lg">
                {BUYER_LANGUAGES.find((l) => l.id === selectedLang)?.flag}
              </span>
              <span>
                Resposta em{" "}
                {BUYER_LANGUAGES.find((l) => l.id === selectedLang)?.label}
              </span>
            </span>
            <span className="text-[10px] text-vinted-400 font-mono font-semibold">
              {activeOutputText.length} carateres
            </span>
          </div>

          {/* Texto exato da resposta */}
          <div
            data-selectable="true"
            className="bg-dark-card/90 border border-dark-border rounded-2xl p-3.5 text-xs text-white leading-relaxed select-text font-sans shadow-inner"
          >
            {activeOutputText}
          </div>

          {/* Tradução/Significado em Português */}
          <div className="bg-dark-surface/60 border border-dark-border/60 rounded-xl px-3 py-2 text-[10px] text-dark-muted">
            <strong className="text-slate-300 block mb-0.5">
              Significado em Português 🇵🇹:
            </strong>
            {activeTranslationPt}
          </div>

          {/* Botão de Copiar Resposta com 1 Toque */}
          <button
            type="button"
            onClick={() => copyToClipboard(activeOutputText, "ai_negotiate_response")}
            className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98] ${
              copiedKey === "ai_negotiate_response"
                ? "bg-emerald-600 text-white shadow-emerald-950/40"
                : "bg-gradient-to-r from-vinted-500 to-vinted-accent text-white shadow-teal-glow hover:brightness-110"
            }`}
          >
            {copiedKey === "ai_negotiate_response" ? (
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
      </section>

      {/* ============================================================== */}
      {/* FERRAMENTA 2: TEMPLATES RÁPIDOS DE 1 TOQUE (EM BAIXO)          */}
      {/* ============================================================== */}
      <section className="bg-dark-card border border-dark-border rounded-3xl p-4 space-y-4 shadow-xl">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-dark-border/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-vinted-500/20 text-vinted-400 flex items-center justify-center border border-vinted-500/40">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                2. Templates Rápidos de 1 Toque
              </h3>
              <p className="text-[10px] text-dark-muted">
                Mensagens pós-venda para InPost, CTT e 5 estrelas
              </p>
            </div>
          </div>
        </div>

        {/* 2.1 Seletor de Bandeira PT / FR / ES */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-dark-muted uppercase font-bold block">
            Escolhe o Idioma dos Templates:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "pt" as const, flag: "🇵🇹", label: "Português", sub: "Portugal" },
              { id: "fr" as const, flag: "🇫🇷", label: "Français", sub: "França / Bélgica" },
              { id: "es" as const, flag: "🇪🇸", label: "Español", sub: "Espanha" },
            ].map((item) => {
              const isSelected = templateLang === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTemplateLang(item.id)}
                  className={`py-2 px-2 rounded-2xl border text-center transition-all active:scale-95 flex flex-col items-center justify-center ${
                    isSelected
                      ? "bg-vinted-500/25 border-vinted-500 text-white shadow-teal-glow ring-1 ring-vinted-500/50"
                      : "bg-dark-surface border-dark-border text-slate-300 hover:text-white"
                  }`}
                >
                  <span className="text-lg leading-none mb-1">{item.flag}</span>
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-[9px] text-dark-muted">{item.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2.2 Os 3 Templates Rápidos */}
        <div className="space-y-3.5 pt-1">
          {/* Template 1: Já enviei no ponto de recolha / cacifo */}
          <QuickTemplateCard
            icon={<PackageCheck className="w-4 h-4 text-cyan-400" />}
            tag="Aviso de Envio"
            title={currentQuick.shipped.title}
            text={currentQuick.shipped.text}
            explanationPt={templateLang !== "pt" ? currentQuick.shipped.ptExpl : undefined}
            onCopy={() => copyToClipboard(currentQuick.shipped.text, "quick_shipped")}
            isCopied={copiedKey === "quick_shipped"}
          />

          {/* Template 2: Obrigado pela compra + 24h embalado */}
          <QuickTemplateCard
            icon={<HeartHandshake className="w-4 h-4 text-emerald-400" />}
            tag="Pós-Compra Imediato"
            title={currentQuick.thankYou.title}
            text={currentQuick.thankYou.text}
            explanationPt={templateLang !== "pt" ? currentQuick.thankYou.ptExpl : undefined}
            onCopy={() => copyToClipboard(currentQuick.thankYou.text, "quick_thank_you")}
            isCopied={copiedKey === "quick_thank_you"}
          />

          {/* Template 3: Pedir 5 estrelas pós-chegada */}
          <QuickTemplateCard
            icon={<Star className="w-4 h-4 text-amber-400" />}
            tag="Avaliação 5 Estrelas"
            title={currentQuick.review.title}
            text={currentQuick.review.text}
            explanationPt={templateLang !== "pt" ? currentQuick.review.ptExpl : undefined}
            onCopy={() => copyToClipboard(currentQuick.review.text, "quick_review")}
            isCopied={copiedKey === "quick_review"}
          />
        </div>
      </section>
    </div>
  );
}

// ==========================================
// COMPONENTE DO CARTÃO DE TEMPLATE RÁPIDO
// ==========================================
interface QuickTemplateCardProps {
  icon: React.ReactNode;
  tag: string;
  title: string;
  text: string;
  explanationPt?: string;
  onCopy: () => void;
  isCopied: boolean;
}

function QuickTemplateCard({
  icon,
  tag,
  title,
  text,
  explanationPt,
  onCopy,
  isCopied,
}: QuickTemplateCardProps) {
  return (
    <div className="bg-dark-surface border border-dark-border hover:border-vinted-500/40 rounded-2xl p-3.5 space-y-2.5 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {icon}
          <span className="text-[11px] font-bold text-white truncate">{tag}</span>
        </div>
        <span className="text-[10px] text-dark-muted font-mono">{text.length} chars</span>
      </div>

      <div
        data-selectable="true"
        className="bg-dark-card border border-dark-border/80 rounded-xl p-3 text-xs text-slate-100 leading-relaxed select-text"
      >
        {text}
      </div>

      {explanationPt && (
        <div className="text-[10px] text-dark-muted px-1 flex items-start gap-1">
          <Info className="w-3 h-3 text-vinted-400 shrink-0 mt-0.5" />
          <span>{explanationPt}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onCopy}
        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
          isCopied
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
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
            <span>Copiar com 1 Toque</span>
          </>
        )}
      </button>
    </div>
  );
}

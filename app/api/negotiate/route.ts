import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30; // 30s timeout

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      buyerMessage,
      intent, // "accept" | "counter" | "guarantee_10_10" | "decline_politely"
      counterPrice,
      targetLanguage, // "fr" | "es" | "it" | "en" | "pt" or auto
      customApiKey,
      customModel,
    } = body;

    const apiKey =
      customApiKey?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!buyerMessage || typeof buyerMessage !== "string" || !buyerMessage.trim()) {
      return NextResponse.json(
        { error: "Por favor insere a mensagem do comprador." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Nenhuma chave da Gemini API foi configurada. Podes adicionar a tua chave gratuita nas 'Definições' da app ou definir GEMINI_API_KEY no painel da Vercel.",
        },
        { status: 400 }
      );
    }

    const preferredModel = customModel?.trim() || "gemini-2.5-flash";

    const intentDescriptions: Record<string, string> = {
      accept: "Aceitar a oferta do comprador com simpatia, pedir para avançar na app e confirmar envio super bem embalado em 24h.",
      counter: `Recusar educadamente a oferta baixa e fazer contraproposta firme de ${
        counterPrice || "20"
      }€ para fechar negócio hoje, com envio em 24h.`,
      guarantee_10_10:
        "Garantir com total segurança que o estado do artigo é 10/10 impecável (sem marcas, defeitos ou odores, exatamente conforme fotos) e que envio hoje mesmo no ponto de recolha/cacifo.",
      decline_politely:
        "Recusar educadamente a oferta por ser muito baixa para o valor real do artigo, explicar com simpatia que o preço anunciado já é muito justo e desejar um ótimo dia de compras na Vinted.",
    };

    const chosenIntentText =
      intentDescriptions[intent] || intentDescriptions["counter"];

    const prompt = `És o assistente de negociação e vendas número 1 na Vinted na Europa.
O vendedor recebeu esta mensagem de um comprador na Vinted:
"""${buyerMessage.trim()}"""

O vendedor quer responder com a seguinte intenção:
"${chosenIntentText}"

${
  targetLanguage
    ? `A língua alvo pretendida é: ${targetLanguage.toUpperCase()}`
    : "Deteta automaticamente a língua do comprador (Francês, Espanhol, Italiano, Inglês ou Português)."
}

Gera uma resposta perfeita, cordial, concisa e altamente persuasiva no estilo habitual de mensagens da Vinted (com emojis simpáticos e discretos como 😊, 📦, ⚡).

Deves responder OBRIGATORIAMENTE em JSON válido com esta estrutura exata:
{
  "detected_language": "código de 2 letras da língua do comprador: fr, es, it, en ou pt",
  "detected_language_name": "Nome da língua em português (ex: Francês 🇫🇷, Espanhol 🇪🇸, etc.)",
  "buyer_translation_pt": "Tradução fiel e clara da mensagem do comprador para Português, para o vendedor perceber exatamente o que foi dito",
  "response_text": "Texto completo da resposta para o comprador na língua dele, pronta a enviar na Vinted",
  "response_translation_pt": "Explicação em português do que está escrito na resposta para tranquilizar o vendedor"
}

Apenas JSON válido, sem wrappers de markdown adicionais.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${preferredModel}:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return NextResponse.json(
        {
          error: `Erro ao comunicar com a Gemini API (${geminiResponse.status}): ${errText}`,
        },
        { status: geminiResponse.status }
      );
    }

    const geminiData = await geminiResponse.json();
    const candidateText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json(
        { error: "A Gemini API não devolveu uma resposta válida." },
        { status: 502 }
      );
    }

    // Clean JSON if needed
    let cleaned = candidateText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      detected_language: parsed.detected_language || "fr",
      detected_language_name: parsed.detected_language_name || "Francês 🇫🇷",
      buyer_translation_pt: parsed.buyer_translation_pt || "",
      response_text: parsed.response_text || "",
      response_translation_pt: parsed.response_translation_pt || "",
    });
  } catch (error: any) {
    console.error("Negotiate API error:", error);
    return NextResponse.json(
      { error: error?.message || "Erro no processamento da resposta com IA." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { GeminiListingResult } from "@/types";

export const maxDuration = 60; // 60s for Vercel functions

const SYSTEM_INSTRUCTION = `És o maior especialista em revenda na Vinted da Europa (mercados Portugal, Espanha, França e Itália).
A tua missão é analisar cuidadosamente as fotos do artigo e as informações fornecidas pelo utilizador para gerar o anúncio perfeito e altamente rentável.

Deves devolver OBRIGATORIAMENTE um único objeto JSON válido (sem texto antes ou depois, sem formatação markdown no wrapper do JSON) com a seguinte estrutura:

{
  "titulo_pt": "Título otimizado para o algoritmo de pesquisa da Vinted (Marca + Modelo/Tipo + Cor + Tamanho/Estado). Máximo 50 caracteres, impactante.",
  "descricao_pt": "Descrição detalhada em Português com estrutura limpa e emojis discretos:\\n\\n✨ ESTADO: [avaliação honesta do estado com base nas fotos e notas]\\n📏 TAMANHO / MEDIDAS: [tamanho da etiqueta e corte/fit]\\n🧵 DETALHES: [material, cor exata, características marcantes, 100% autêntico]\\n📦 ENVIO: Envio super rápido em 24h-48h, embalado com todo o cuidado (InPost / CTT / DPD).\\n\\n💬 Qualquer dúvida ou proposta, responde no chat!",
  "traducao_es_fr": "🇪🇸 DESCRIPCIÓN RÁPIDA (ES):\\n[2 a 3 frases em espanhol perfeito com o artigo, estado, tamanho e 'Envío rápido en 24h'].\\n\\n🇫🇷 DESCRIPTION RAPIDE (FR):\\n[2 a 3 frases em francês perfeito com o artigo, estado, tamanho e 'Envoi soigné et rapide en 24h'].",
  "hashtags": [
    "#hashtag1",
    "#hashtag2",
    "#hashtag3",
    "#hashtag4",
    "#hashtag5",
    "#hashtag6",
    "#hashtag7",
    "#hashtag8",
    "#hashtag9",
    "#hashtag10",
    "#hashtag11",
    "#hashtag12"
  ],
  "categoria_sugerida": "Caminho exato sugerido na Vinted (ex: Homem > Roupa > Casacos > Blusões)",
  "precos": {
    "venda_rapida": {
      "valor": 22,
      "descricao": "Venda rápida (24-48h): Preço competitivo para despachar logo o artigo."
    },
    "preco_justo": {
      "valor": 32,
      "descricao": "Preço Justo / Mercado: Melhor equilíbrio entre margem de lucro e velocidade."
    },
    "com_margem": {
      "valor": 38,
      "descricao": "Margem de negociação: Ideal para listar e aceitar ofertas de 10% a 20% dos compradores."
    }
  },
  "marca_detetada": "Marca detetada ou inferida",
  "estado_detetado": "Novo com etiquetas / Muito bom estado / etc.",
  "dicas_envio": "Dica prática para maximizar a venda (ex: tirar foto com fita métrica, destacar botão extra, etc.)"
}

REGRAS CRÍTICAS:
1. Os preços DEVEM ser números inteiros realistas em EUROS (€) baseados na marca e estado do artigo no mercado de segunda mão Vinted europeu.
2. Não uses floreados falsos nem inventes defeitos se o artigo parecer novo.
3. Se o utilizador indicou notas (ex: tamanho, defeito, ano), integra-as com máxima precisão.
4. O campo 'hashtags' deve ter entre 10 e 15 hashtags relevantes em minúsculas (marcas, modelos, estilos como #streetwear, #vintage, #y2k, #gorpcore, #casual, etc.).
5. Retorna EXCLUSIVAMENTE o JSON válido.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { images, category, quickNotes, customApiKey, customModel } = body;

    // Determine API Key: custom key from client localStorage or server environment variable
    const apiKey =
      customApiKey?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Nenhuma chave da Gemini API foi configurada. Podes adicionar a tua chave gratuita nas 'Definições' da app ou definir GEMINI_API_KEY no painel da Vercel.",
        },
        { status: 400 }
      );
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Por favor envia pelo menos uma foto do artigo." },
        { status: 400 }
      );
    }

    const preferredModel = customModel?.trim() || "gemini-2.5-flash";

    // Prepare parts for Gemini API
    const contentsParts: Array<Record<string, unknown>> = [];

    // Prompt context
    let promptText = `Analisa estas ${images.length} foto(s) deste artigo para vender na Vinted.\n`;
    if (category) {
      promptText += `Categoria selecionada pelo vendedor: ${category}\n`;
    }
    if (quickNotes) {
      promptText += `Notas adicionais do vendedor: ${quickNotes}\n`;
    }
    promptText += `Gera o anúncio completo com preços e traduções seguindo estritamente as instruções e o formato JSON.`;

    contentsParts.push({ text: promptText });

    // Add image parts
    for (const img of images) {
      if (img.base64Data) {
        contentsParts.push({
          inlineData: {
            mimeType: img.mimeType || "image/jpeg",
            data: img.base64Data,
          },
        });
      }
    }

    const requestPayload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: "user",
          parts: contentsParts,
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    };

    // Candidate models to try in sequence
    const modelsToTry = [
      preferredModel,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ].filter((v, i, a) => a.indexOf(v) === i); // unique

    let responseData: any = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        });

        if (res.ok) {
          responseData = await res.json();
          break;
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = errData;
          console.warn(`Model ${model} failed, trying fallback...`, errData);
        }
      } catch (err: any) {
        lastError = err?.message || err;
      }
    }

    if (!responseData) {
      const errorMsg =
        lastError?.error?.message ||
        "Não foi possível contactar a API do Gemini. Verifica se a tua chave API é válida e tem permissões.";
      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

    // Extract text from Gemini response
    const candidate = responseData.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: "A resposta do Gemini veio vazia. Tenta novamente com outras fotos." },
        { status: 500 }
      );
    }

    // Parse JSON
    let cleanJson = rawText.trim();
    // In case model wrapped in markdown code blocks
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed: GeminiListingResult = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Erro na rota /api/generate:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ocorreu um erro inesperado ao processar a imagem. Verifica os dados e tenta novamente.",
      },
      { status: 500 }
    );
  }
}

export interface PriceOption {
  valor: number;
  descricao: string;
}

export interface ClothingDetails {
  fit?: string; // 'Oversized' | 'Boxy Fit' | 'Regular' | 'Slim'
  widthPitToPit?: string; // cm
  lengthCm?: string; // cm
}

export interface TechDetails {
  testedAndWorking: boolean;
  pristineCondition: boolean;
  bubbleWrapPackaging: boolean;
  accessoriesIncluded: boolean;
}

export interface FootwearDetails {
  sizeEu?: string; // ex: '42'
  authenticatedOriginal: boolean;
}

export interface AntiHaggleData {
  targetNetPrice?: number;
  suggestedListPrice?: number;
}


export interface GeminiListingResult {
  titulo_pt: string;
  descricao_pt: string;
  traducao_es_fr: string;
  hashtags: string[];
  categoria_sugerida: string;
  precos: {
    venda_rapida: PriceOption;
    preco_justo: PriceOption;
    com_margem: PriceOption;
  };
  marca_detetada?: string;
  estado_detetado?: string;
  dicas_envio?: string;
}

export interface ProcessedImage {
  id: string;
  file?: File;
  previewUrl: string;
  base64Data: string; // pure base64 without prefix
  mimeType: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export interface SavedListingItem {
  id: string;
  createdAt: string;
  category: string;
  notes?: string;
  result: GeminiListingResult;
  thumbnail?: string;
}

export interface InventoryItem {
  id: string;
  createdAt: string;
  titulo: string;
  category: string;
  status: "active" | "sold";
  precoListado: number;
  precoVenda?: number;
  precoCusto?: number;
  soldAt?: string;
  thumbnail?: string;
  notes?: string;
  result?: GeminiListingResult;
}

export interface AppSettings {
  geminiApiKey: string;
  model: string;
  vintedCountry: string; // 'pt', 'es', 'fr'
  autoCopyTitle: boolean;
}


# 👗 Vinted AI Studio — Mobile-First PWA para iPhone

Uma Web App progressiva (PWA) de alto rendimento, desenhada especificamente para iPhone, pronta para deploy na Vercel e desenvolvida para revendedores e utilizadores da Vinted (mercados Portugal, Espanha, França e Itália).

![Vinted AI Studio Dark Mode](public/icon-512.png)

---

## ✨ Funcionalidades Principais

### 1. Câmara & Galeria Direta do iPhone
- Tira fotos diretamente com a câmara ou escolhe até 4 fotos da galeria do iPhone.
- **Compressão automática no cliente**: Imagens de 5MB–10MB do iPhone são convertidas em JPEG otimizado (~150KB–250KB) via HTML5 Canvas antes do envio. O upload é instantâneo e poupa dados móveis.
- 4 slots inteligentes: Capa/Frente, Costas, Etiqueta/Tamanho e Detalhes/Estado.
- Seletor rápido de categoria (Streetwear, Jogos, Hardware, Calçado, etc.) e tags de notas rápidas em 1 toque.

### 2. Análise Multimodal com Gemini Vision
- Modelos suportados: `gemini-2.5-flash` (padrão), `gemini-3.8-flash` e `gemini-2.5-pro`.
- Suporte para configurar a chave `GEMINI_API_KEY`:
  - Nas variáveis de ambiente da Vercel; ou
  - Diretamente na aba "Definições" da app (guardada no `localStorage` do iPhone).
- Devolve JSON estruturado com:
  - Título SEO (`titulo_pt`)
  - 3 Sugestões de Preço em Euros (€): Venda Rápida, Preço Justo e Margem de Negociação
  - Descrição limpa em Português com emojis
  - Resumos rápidos em Espanhol e Francês no rodapé
  - 10 a 15 Hashtags estratégicas
  - Categoria sugerida na Vinted

### 3. Ecrã de Resultado com Cópia a 1 Toque
- 3 Cartões de preço destacados no topo em Euros.
- Botões separados para **"Copiar Título (1 Toque)"** e **"Copiar Descrição Completa (1 Toque)"** com feedback `Copiado! ✓` e confetes.
- Botão direto para salvar na lista de **"Meus Artigos & Lucro"**.
- Atalho para abrir a app oficial da Vinted (`vinted://`).

### 4. 💬 Aba "Negociador & Respostas" (Assistente de Chat)
- Respostas prontas para copiar em **Português 🇵🇹**, **Espanhol 🇪🇸** e **Francês 🇫🇷**:
  - **Recusar oferta muito baixa educadamente e propor contraproposta**: Inputs dinâmicos para a oferta recebida e para o preço mínimo aceitável.
  - **Avisar que já enviei no cacifo/ponto de recolha**: Seleciona InPost, DPD, Mondial Relay ou CTT.
  - **Pedir avaliação de 5 estrelas**: Mensagem cordial pós-entrega que aumenta a classificação do perfil.
  - **IA Mensagens**: Cola qualquer mensagem de um comprador em francês ou espanhol e gera resposta instantânea com Gemini.

### 5. 💰 Aba "Meus Artigos & Lucro" (LocalStorage)
- Lista de artigos em **"Rascunhos / À Venda"** e **"Vendidos"**.
- Dashboard de lucro no topo:
  - **Total Ganho (€)** com vendas concluídas.
  - Lucro limpo descontando custos de compra (opcional).
  - Número de artigos ativos e valor total do stock.
  - Gráfico visual da taxa de venda e conversão.
- Ações rápidas:
  - Marcar como vendido e registar o preço final negociado.
  - Reabrir o anúncio completo gerado a qualquer momento para copiar novamente.
  - Adicionar artigos manualmente.

### 6. Layout Mobile iOS & PWA Apple-Grade
- **Barra inferior iOS**: `padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 6px)` sem margens pretas.
- Dark mode inspirado nas cores da Vinted (`#007782`, `#00a8b5`, `#090d0f`).
- Instalação como app nativa no Safari através de **"Adicionar ao Ecrã Principal"**.

---

## 🚀 Como Fazer Deploy na Vercel

1. Cria um repositório no GitHub com os ficheiros.
2. Na [Vercel](https://vercel.com), importa o projeto.
3. Adiciona a variável de ambiente opcional `GEMINI_API_KEY` (podes obtê-la grátis no [Google AI Studio](https://aistudio.google.com/app/apikey)) ou configura-a diretamente no iPhone na aba Definições.
4. Clica em **Deploy**.

---

## 📲 Como Instalar no iPhone (PWA Standalone)

1. Abre o URL da app no **Safari** do iPhone.
2. Toca no botão de **Partilha** (ícone do quadrado com a seta para cima ⎋).
3. Seleciona **"Adicionar ao Ecrã Principal"**.
4. A app abrirá em ecrã inteiro nativo.

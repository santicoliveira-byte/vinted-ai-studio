import { ProcessedImage } from "@/types";

export async function compressAndProcessImage(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Não foi possível aceder ao contexto do canvas");
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.82 quality (great quality, small footprint)
          const mimeType = "image/jpeg";
          const dataUrl = canvas.toDataURL(mimeType, 0.82);

          // Strip data:image/jpeg;base64,
          const base64Data = dataUrl.split(",")[1];
          const compressedBytes = atob(base64Data).length;
          const compressedSizeKb = Math.round(compressedBytes / 1024);

          resolve({
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            file,
            previewUrl: dataUrl,
            base64Data,
            mimeType,
            originalSizeKb,
            compressedSizeKb,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error("Erro ao ler ficheiro de imagem"));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        reject(new Error("Falha ao ler o ficheiro"));
      }
    };

    reader.onerror = () => reject(new Error("Erro ao ler o ficheiro"));
    reader.readAsDataURL(file);
  });
}

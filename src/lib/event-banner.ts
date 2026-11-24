const supportedTypes = ["image/jpeg", "image/png", "image/webp"];

export async function readEventBanner(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || !value.size) return undefined;
  if (!supportedTypes.includes(value.type) || value.size > 5_000_000) {
    throw new Error("Escolha uma foto JPG, PNG ou WebP de até 5 MB.");
  }

  const url = URL.createObjectURL(value);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 960 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.8, 0.65, 0.5, 0.35]) {
        const banner = canvas.toDataURL("image/jpeg", quality);
        if (banner.length <= 120_000 && banner.startsWith("data:image/jpeg;base64,")) return banner;
      }
    }
  } catch {
    throw new Error("Não foi possível abrir esta foto. Tente outro arquivo.");
  } finally {
    URL.revokeObjectURL(url);
  }
  throw new Error("Não foi possível compactar esta foto. Tente uma imagem menor.");
}

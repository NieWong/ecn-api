export const inferFileKind = (mimeType: string): "IMAGE" | "DOCUMENT" | "OTHER" => {
  if (mimeType.startsWith("image/")) {
    return "IMAGE";
  }
  if (mimeType === "application/pdf") {
    return "DOCUMENT";
  }
  return "OTHER";
};

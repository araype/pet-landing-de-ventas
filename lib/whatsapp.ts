const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "51920046753";

export function whatsappLink(message: string): string {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

export function singleProductMessage(name: string, colors: string): string {
  const detail = colors ? ` (${colors})` : "";
  return `Hola Aracely, quisiera consultar por: ${name}${detail}`;
}

export function multiProductMessage(
  items: { name: string; colors: string }[]
): string {
  const lines = items.map(
    (item) => `- ${item.name}${item.colors ? ` (${item.colors})` : ""}`
  );
  return `Hola Aracely, quisiera consultar por:\n${lines.join("\n")}`;
}

export function generalInquiryMessage(): string {
  return "Hola Aracely, vi tu catálogo y quisiera consultar por algunos productos";
}

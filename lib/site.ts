export const site = {
  name: "Maysa Braids",
  owner: "Maysa",
  city: "Nova Contagem · MG",
  instagramHandle: "maysabraids._",
  instagramUrl: "https://www.instagram.com/maysabraids._/",
  // Número público divulgado no perfil/site da Maysa: (31) 99271-2047
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5531992712047",
  whatsappDisplay: "(31) 99271-2047",
  timezone: "America/Sao_Paulo",
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function instagramPost(code: string) {
  return `https://www.instagram.com/${site.instagramHandle}/p/${code}/`;
}

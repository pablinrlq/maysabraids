export type Service = {
  id: string;
  title: string;
  group: "simples" | "jumbo";
  detail: string;
  price: number;
};

// Tabela divulgada pela Maysa (valores em reais).
export const services: Service[] = [
  { id: "topo", title: "Topo", group: "simples", detail: "Sem jumbo", price: 30 },
  { id: "lateral", title: "Lateral", group: "simples", detail: "Sem jumbo", price: 25 },
  { id: "tiara", title: "Tiara", group: "simples", detail: "Sem jumbo", price: 40 },
  { id: "boxeadora", title: "Boxeadora", group: "simples", detail: "Sem jumbo", price: 80 },
  { id: "ghana", title: "Ghana braids", group: "jumbo", detail: "Com jumbo", price: 160 },
  { id: "box", title: "Box braids", group: "jumbo", detail: "Com jumbo", price: 270 },
  { id: "fulani", title: "Fulani braids", group: "jumbo", detail: "Com jumbo", price: 280 },
  { id: "french", title: "French curls", group: "jumbo", detail: "Com jumbo", price: 290 },
  { id: "goddess", title: "Goddess braids", group: "jumbo", detail: "Com jumbo", price: 295 },
];

export const serviceById = new Map(services.map((service) => [service.id, service]));

export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

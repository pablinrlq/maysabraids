export type Service = {
  id: string;
  title: string;
  /** Valor em reais; null = sob consulta. */
  price: number | null;
  /** true = com jumbo, false = sem jumbo, ausente = não informado. */
  jumbo?: boolean;
};

// As únicas tranças oferecidas pela Maysa (valores da tabela divulgada por ela).
export const services: Service[] = [
  { id: "ghana", title: "Ghana Braids", price: 160, jumbo: true },
  { id: "nago", title: "Nagô", price: null },
  { id: "fulani", title: "Fulani Braids", price: 280, jumbo: true },
  { id: "tiara", title: "Tiara", price: 40, jumbo: false },
  { id: "lateral", title: "Lateral", price: 25, jumbo: false },
  { id: "goddess", title: "Goddess Braids", price: 295, jumbo: true },
  { id: "box", title: "Box Braids", price: 270, jumbo: true },
];

export const serviceById = new Map(services.map((service) => [service.id, service]));

export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

export const priceLabel = (service: Service) => (service.price === null ? "Sob consulta" : brl(service.price));

export const jumboLabel = (service: Service) =>
  service.jumbo === undefined ? null : service.jumbo ? "Com jumbo" : "Sem jumbo";

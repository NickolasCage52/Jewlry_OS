export type Availability = {
  showroom: number;
  warehouse: number;
  reserved: number;
  inbound: number;
  madeToOrder: boolean;
};

export type CatalogProduct = {
  sku: string;
  name: string;
  statusLabel: string;
  price: number | null;
  metal: string;
  stone: string;
  size: string;
  weight: string;
  collection: string;
  availability: Availability;
  recentDeals: {
    client: string;
    amount: string;
    when: string;
    stage: string;
  }[];
  changeLog: { when: string; who: string; text: string }[];
};

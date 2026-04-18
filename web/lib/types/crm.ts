export type HistoryEntry = {
  type: string;
  text: string;
  date: string;
  author: string;
};

export type ClientProductRef = {
  name: string;
  sku: string;
  stock: string;
  color: string;
};

export type ClientRecord = {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: string;
  lastContact: string;
  lastAction: string;
  deal: {
    product: string;
    sku: string;
    price: number;
    stock: string;
    color: string;
    productionOrderId?: string;
  };
  nextAction: { type: string; date: string } | null;
  history: HistoryEntry[];
  products: ClientProductRef[];
  notes?: string;
};

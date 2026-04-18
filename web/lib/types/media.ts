export type MediaAsset = {
  id: number;
  name: string;
  sku: string;
  type: "photo" | "video" | "source";
  channel: string[];
  category: string;
  metal: string;
  stone: string;
  date: string;
  size: string;
  color: string;
  status?: "published" | "review" | "archive";
  tags?: string[];
};

import { AiSearchClient } from "@/components/ai/AiSearchClient";
import { getAiFlagsForClient } from "@/lib/ai/public-flags";

export default function AiSearchPage() {
  const flags = getAiFlagsForClient();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">AI-поиск</h1>
        <p className="text-sm text-[var(--muted)]">
          Структурный поиск по каталогу, медиа, разделу «ЧаВо» и демо-клиентам; опционально краткое
          пояснение модели (только на основе найденной структуры данных).
        </p>
      </div>
      <AiSearchClient flags={flags} />
    </div>
  );
}

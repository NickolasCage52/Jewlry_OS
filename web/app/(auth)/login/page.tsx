import { signIn } from "@/lib/auth/actions";
import { DEMO_ROLE_OPTIONS } from "@/lib/auth/demo-users";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export default function LoginPage() {
  return (
    <div className="ui-card ui-card--padding w-full max-w-md">
      <h1 className="font-display text-3xl tracking-tight text-[var(--ink)]">
        Операционная система ювелирного бизнеса
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Вход (демо): выберите роль — cookie-сессия на 7 дней.
      </p>
      <form action={signIn} className="mt-8 space-y-4">
        <label className="block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Роль
          <Select name="role" required className="mt-2">
            {DEMO_ROLE_OPTIONS.map((o) => (
              <option key={o.role} value={o.role}>
                {o.label} — {o.hint}
              </option>
            ))}
          </Select>
        </label>
        <Button type="submit" variant="primary" className="w-full">
          Войти
        </Button>
      </form>
    </div>
  );
}

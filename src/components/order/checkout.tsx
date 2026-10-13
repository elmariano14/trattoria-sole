"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { restaurant } from "@data/restaurant";
import { placeOrder } from "@/app/actions/order";
import { useCart } from "@/components/cart/cart-provider";
import { CheckIcon, ChevronLeftIcon, ClockIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { getDish } from "@/lib/menu";
import { formatPrice } from "@/lib/money";
import type { PickupDay } from "@/lib/slots";

const STEPS = ["Koszyk", "Odbiór", "Dane", "Podsumowanie"] as const;

type Contact = { name: string; phone: string; email: string; notes: string; website: string };
type Slot = { iso: string; time: string; dayLabel: string };

export function Checkout({ unavailable }: { unavailable: string[] }) {
  const cart = useCart();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [contact, setContact] = useState<Contact>({ name: "", phone: "", email: "", notes: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const blocked = cart.lines.filter((l) => unavailable.includes(l.dishId));

  const go = (next: number) => {
    setStep(next);
    setMessage(null);
    // Przenosimy fokus i widok na nagłówek kroku – ważne na telefonie i dla czytników ekranu.
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const submit = () => {
    if (!slot) return go(1);
    startTransition(async () => {
      const result = await placeOrder({
        items: cart.lines,
        pickupAt: slot.iso,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        notes: contact.notes,
        website: contact.website,
      });
      if (result.ok) {
        cart.clear();
        router.push(`/zamowienie/${result.id}`);
        return;
      }
      if (result.slotTaken) {
        setSlot(null);
        go(1);
        setMessage(result.message);
        return;
      }
      if (result.errors && Object.keys(result.errors).some((k) => k in contact)) {
        setErrors(result.errors);
        go(2);
        setMessage(result.message);
        return;
      }
      setMessage(result.message);
    });
  };

  if (!cart.ready) {
    return <div className="h-80 animate-pulse rounded-3xl bg-pane-deep/60" aria-label="Wczytywanie koszyka" />;
  }

  if (cart.count === 0) {
    return (
      <div className="rounded-3xl border border-pane-line bg-[#fffaf1] px-6 py-14 text-center">
        <h2 className="text-3xl">Twoje zamówienie jest puste</h2>
        <p className="mx-auto mt-3 max-w-sm text-muted">Dodaj dania z menu, a potem wybierz godzinę odbioru.</p>
        <Link href="/menu" className="btn btn-primary mt-8 px-6">
          Przejdź do menu
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div>
        <ol className="flex gap-2 text-sm" aria-label="Kroki zamówienia">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col gap-1.5" aria-current={i === step ? "step" : undefined}>
              <span className={`h-1 rounded-full ${i <= step ? "bg-pomodoro" : "bg-pane-line"}`} />
              <span className={i === step ? "font-semibold" : "text-muted"}>
                <span className="sr-only">Krok {i + 1} z 4: </span>
                {s}
              </span>
            </li>
          ))}
        </ol>

        <h2 ref={headingRef} tabIndex={-1} className="mt-8 scroll-mt-6 text-4xl outline-none">
          {["Twoje zamówienie", "Kiedy odbierzesz?", "Dane do zamówienia", "Sprawdź i zamów"][step]}
        </h2>

        {message && (
          <p role="alert" className="mt-4 rounded-2xl border border-pomodoro/30 bg-pomodoro/8 px-4 py-3 text-pomodoro-dark">
            {message}
          </p>
        )}

        <div className="mt-6">
          {step === 0 && (
            <CartStep
              unavailable={unavailable}
              onNext={() => go(1)}
              blocked={blocked.length > 0}
            />
          )}
          {step === 1 && <PickupStep selected={slot} onSelect={setSlot} onBack={() => go(0)} onNext={() => go(2)} refreshKey={message} />}
          {step === 2 && (
            <ContactStep
              value={contact}
              errors={errors}
              onChange={(c) => setContact(c)}
              onBack={() => go(1)}
              onNext={(errs) => {
                setErrors(errs);
                if (Object.keys(errs).length === 0) go(3);
              }}
            />
          )}
          {step === 3 && slot && (
            <SummaryStep slot={slot} contact={contact} pending={pending} onBack={() => go(2)} onEdit={go} onSubmit={submit} />
          )}
        </div>
      </div>

      <aside className="hidden rounded-3xl bg-castagna p-6 text-pane lg:sticky lg:top-6 lg:block" aria-label="Podsumowanie koszyka">
        <h2 className="text-2xl">Zamówienie</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {cart.lines.map((l) => {
            const d = getDish(l.dishId);
            return (
              <li key={l.dishId} className="flex justify-between gap-4">
                <span>
                  {l.quantity} × {d?.name}
                </span>
                <span className="tabular-nums">{formatPrice((d?.price ?? 0) * l.quantity)}</span>
              </li>
            );
          })}
        </ul>
        {slot && (
          <p className="mt-4 flex items-center gap-2 border-t border-castagna-line pt-4 text-sm">
            <ClockIcon size={16} className="text-zafferano" /> Odbiór: {slot.dayLabel}, {slot.time}
          </p>
        )}
        <p className="mt-4 flex justify-between border-t border-castagna-line pt-4 text-lg font-semibold">
          <span>Razem</span>
          <span className="tabular-nums">{formatPrice(cart.total)}</span>
        </p>
        <p className="mt-1 text-sm text-pane/65">Płatność przy odbiorze</p>
      </aside>
    </div>
  );
}

function StepNav({ onBack, next }: { onBack?: () => void; next: React.ReactNode }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-pane-line pt-6 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-1 self-start font-medium text-muted hover:text-castagna">
          <ChevronLeftIcon size={18} /> Wstecz
        </button>
      ) : (
        <Link href="/menu" className="inline-flex min-h-11 items-center gap-1 self-start font-medium text-muted hover:text-castagna">
          <ChevronLeftIcon size={18} /> Dodaj coś jeszcze
        </Link>
      )}
      {next}
    </div>
  );
}

function CartStep({ unavailable, onNext, blocked }: { unavailable: string[]; onNext: () => void; blocked: boolean }) {
  const { lines, setQuantity, remove, total } = useCart();
  return (
    <>
      <ul className="divide-y divide-pane-line border-y border-pane-line">
        {lines.map((l) => {
          const d = getDish(l.dishId);
          if (!d) return null;
          const off = unavailable.includes(d.id);
          return (
            <li key={l.dishId} className="flex items-center gap-4 py-4">
              <div className={`relative size-16 shrink-0 overflow-hidden rounded-full ${off ? "grayscale" : ""}`}>
                <Image src={d.image} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl leading-tight">{d.name}</p>
                {off ? (
                  <p className="text-sm font-medium text-pomodoro">Chwilowo niedostępne, usuń z zamówienia</p>
                ) : (
                  <p className="text-sm text-muted tabular-nums">{formatPrice(d.price)} / szt.</p>
                )}
                <div className="mt-2 flex items-center gap-3">
                  <div className="inline-flex items-center rounded-full border-[1.5px] border-castagna/25" role="group" aria-label={`Ilość: ${d.name}`}>
                    <button type="button" className="grid size-9 place-items-center rounded-full hover:bg-pane-deep" onClick={() => setQuantity(d.id, l.quantity - 1)} aria-label={`Zmniejsz ilość: ${d.name}`}>
                      <MinusIcon size={14} />
                    </button>
                    <span className="min-w-6 text-center font-semibold tabular-nums">{l.quantity}</span>
                    <button type="button" className="grid size-9 place-items-center rounded-full hover:bg-pane-deep" onClick={() => setQuantity(d.id, l.quantity + 1)} aria-label={`Zwiększ ilość: ${d.name}`} disabled={off}>
                      <PlusIcon size={14} />
                    </button>
                  </div>
                  <button type="button" onClick={() => remove(d.id)} className="min-h-9 text-sm text-muted underline underline-offset-4 hover:text-pomodoro">
                    Usuń
                  </button>
                </div>
              </div>
              <p className="self-start font-display text-xl tabular-nums">{formatPrice(d.price * l.quantity)}</p>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 flex justify-between text-lg font-semibold">
        <span>Razem</span>
        <span className="tabular-nums">{formatPrice(total)}</span>
      </p>
      <StepNav
        next={
          <button type="button" className="btn btn-primary px-6" onClick={onNext} disabled={blocked}>
            Wybierz godzinę odbioru
          </button>
        }
      />
    </>
  );
}

function PickupStep({
  selected,
  onSelect,
  onBack,
  onNext,
  refreshKey,
}: {
  selected: Slot | null;
  onSelect: (s: Slot) => void;
  onBack: () => void;
  onNext: () => void;
  refreshKey: string | null;
}) {
  const [days, setDays] = useState<PickupDay[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const res = await fetch("/api/pickup-slots", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data: { days: PickupDay[] } = await res.json();
      setDays(data.days);
      if (selected) {
        const i = data.days.findIndex((d) => d.slots.some((s) => s.iso === selected.iso));
        if (i >= 0) setDayIndex(i);
      }
    } catch {
      setFailed(true);
    }
  }, [selected]);

  useEffect(() => {
    // Sloty pobieramy przy wejściu na krok i po odrzuceniu terminu przez serwer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (failed) {
    return (
      <div>
        <p>Nie udało się pobrać wolnych terminów.</p>
        <button type="button" className="btn btn-ghost mt-4" onClick={load}>
          Spróbuj ponownie
        </button>
      </div>
    );
  }
  if (!days) return <div className="h-64 animate-pulse rounded-3xl bg-pane-deep/60" aria-label="Wczytywanie terminów" />;
  if (days.length === 0) {
    return <p>Na najbliższe dni nie mamy już wolnych terminów odbioru. Zadzwoń do nas: {restaurant.phone}.</p>;
  }

  const day = days[Math.min(dayIndex, days.length - 1)];

  return (
    <>
      <p className="max-w-xl text-castagna/80">
        Na każdy kwadrans przyjmujemy najwyżej {restaurant.pickup.maxOrdersPerSlot} zamówienia, dzięki temu wszystko wychodzi
        z kuchni świeże i na czas. Najwcześniejszy odbiór: {restaurant.pickup.leadMinutes} minut od zamówienia.
      </p>

      <div role="group" aria-label="Dzień odbioru" className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {days.map((d, i) => (
          <button
            key={d.date}
            type="button"
            aria-pressed={i === dayIndex}
            onClick={() => setDayIndex(i)}
            className={`min-h-11 shrink-0 rounded-full border-[1.5px] px-4 text-sm font-medium first-letter:uppercase ${
              i === dayIndex ? "border-castagna bg-castagna text-pane" : "border-pane-line bg-[#fffaf1] hover:border-castagna/50"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <fieldset className="mt-6">
        <legend className="sr-only">Godzina odbioru, {day.label}</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {day.slots.map((s) => {
            const isSel = selected?.iso === s.iso;
            return (
              <button
                key={s.iso}
                type="button"
                disabled={!s.available}
                aria-pressed={isSel}
                onClick={() => onSelect({ iso: s.iso, time: s.time, dayLabel: day.label })}
                className={`flex min-h-14 flex-col items-center justify-center rounded-2xl border-[1.5px] text-base font-semibold tabular-nums transition-colors ${
                  isSel
                    ? "border-pomodoro bg-pomodoro text-white"
                    : s.available
                      ? "border-pane-line bg-[#fffaf1] hover:border-castagna"
                      : "cursor-not-allowed border-transparent bg-pane-deep/60 text-castagna/40"
                }`}
              >
                {s.time}
                <span className={`text-[0.7rem] font-medium ${isSel ? "text-white/85" : "text-muted"}`}>
                  {!s.available ? "brak miejsc" : s.left === 1 ? "ostatnie miejsce" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <StepNav
        onBack={onBack}
        next={
          <button type="button" className="btn btn-primary px-6" onClick={onNext} disabled={!selected}>
            {selected ? `Dalej: odbiór o ${selected.time}` : "Wybierz godzinę"}
          </button>
        }
      />
    </>
  );
}

function ContactStep({
  value,
  errors,
  onChange,
  onBack,
  onNext,
}: {
  value: Contact;
  errors: Record<string, string>;
  onChange: (c: Contact) => void;
  onBack: () => void;
  onNext: (errors: Record<string, string>) => void;
}) {
  const id = useId();
  const set = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...value, [k]: e.target.value });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (value.name.trim().length < 2) errs.name = "Podaj imię (min. 2 znaki).";
    if (!/^(\+48|0048)?\d{9}$/.test(value.phone.replace(/[\s\-()]/g, ""))) errs.phone = "Podaj numer telefonu: 9 cyfr.";
    if (value.email && !/^\S+@\S+\.\S+$/.test(value.email)) errs.email = "Sprawdź adres e-mail.";
    onNext(errs);
  };

  const field = (k: "name" | "phone" | "email", label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`${id}-${k}`} className="field-label">
        {label}
      </label>
      <input
        id={`${id}-${k}`}
        className="field"
        value={value[k]}
        onChange={set(k)}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `${id}-${k}-err` : undefined}
        {...props}
      />
      {errors[k] && (
        <p id={`${id}-${k}-err`} className="field-error">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        validate();
      }}
    >
      <div className="grid max-w-xl gap-5">
        {field("name", "Imię", { autoComplete: "given-name", required: true, placeholder: "Jan" })}
        {field("phone", "Telefon", { type: "tel", autoComplete: "tel", inputMode: "tel", required: true, placeholder: "000 000 000" })}
        {field("email", "E-mail (opcjonalnie, wyślemy potwierdzenie)", {
          type: "email",
          autoComplete: "email",
          placeholder: "jan.kowalski@example.com",
        })}
        <div>
          <label htmlFor={`${id}-notes`} className="field-label">
            Uwagi do zamówienia (opcjonalnie)
          </label>
          <textarea id={`${id}-notes`} className="field min-h-24" value={value.notes} onChange={set("notes")} maxLength={300} placeholder="Np. bez cebuli, alergia na orzechy" />
        </div>
        {/* Pole-pułapka dla botów – ukryte przed ludźmi i czytnikami ekranu. */}
        <div aria-hidden className="absolute -left-[9999px]">
          <label htmlFor={`${id}-website`}>Strona www</label>
          <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={value.website} onChange={set("website")} />
        </div>
        <p className="text-sm text-muted">Telefon wykorzystamy tylko wtedy, gdy będziemy musieli coś ustalić przy zamówieniu.</p>
      </div>
      <StepNav onBack={onBack} next={<button className="btn btn-primary px-6">Przejdź do podsumowania</button>} />
    </form>
  );
}

function SummaryStep({
  slot,
  contact,
  pending,
  onBack,
  onEdit,
  onSubmit,
}: {
  slot: Slot;
  contact: Contact;
  pending: boolean;
  onBack: () => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
}) {
  const { lines, total } = useCart();
  return (
    <>
      <div className="border-t border-pane-line">
        <SummaryRow title="Dania" onEdit={() => onEdit(0)}>
          <ul className="space-y-1">
            {lines.map((l) => {
              const d = getDish(l.dishId);
              return (
                <li key={l.dishId} className="flex gap-6">
                  <span>
                    {l.quantity} × {d?.name}
                  </span>
                  <span className="ml-auto tabular-nums text-muted">{formatPrice((d?.price ?? 0) * l.quantity)}</span>
                </li>
              );
            })}
          </ul>
        </SummaryRow>
        <SummaryRow title="Odbiór osobisty" onEdit={() => onEdit(1)}>
          <p className="first-letter:uppercase">
            {slot.dayLabel}, godz. {slot.time}
          </p>
          <p className="text-sm text-muted">
            {restaurant.address.street}, {restaurant.address.city}
          </p>
        </SummaryRow>
        <SummaryRow title="Kontakt" onEdit={() => onEdit(2)}>
          <p>
            {contact.name}, {contact.phone}
          </p>
          {contact.email && <p className="text-sm text-muted">{contact.email}</p>}
          {contact.notes && <p className="mt-1 text-sm">„{contact.notes}”</p>}
        </SummaryRow>
        <div className="py-4">
          <h3 className="font-sans text-sm font-semibold text-muted">Płatność</h3>
          <p className="mt-1 flex items-center gap-2">
            <CheckIcon size={18} className="text-oliva" /> Przy odbiorze, gotówką lub kartą
          </p>
        </div>
      </div>
      <p className="mt-2 flex justify-between text-xl font-semibold">
        <span>Do zapłaty</span>
        <span className="tabular-nums">{formatPrice(total)}</span>
      </p>
      <StepNav
        onBack={onBack}
        next={
          <button type="button" className="btn btn-primary px-6" onClick={onSubmit} disabled={pending}>
            {pending ? "Wysyłamy zamówienie…" : `Zamawiam i płacę przy odbiorze`}
          </button>
        }
      />
    </>
  );
}

function SummaryRow({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-pane-line py-4">
      <div>
        <h3 className="font-sans text-sm font-semibold text-muted">{title}</h3>
        <div className="mt-1">{children}</div>
      </div>
      <button type="button" onClick={onEdit} className="min-h-9 shrink-0 text-sm font-medium text-pomodoro underline-offset-4 hover:underline">
        Zmień
      </button>
    </div>
  );
}

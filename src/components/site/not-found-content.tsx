import Link from "next/link";

/** Treść strony 404 – wspólna dla notFound() w sekcji publicznej i nieznanych adresów. */
export function NotFoundContent() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <div aria-hidden className="mx-auto size-28 rounded-full bg-zafferano" />
      <h1 className="mt-8 text-5xl">Tej strony nie ma w karcie</h1>
      <p className="mt-4 text-castagna/80">Adres mógł się zmienić albo zawiera literówkę.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/menu" className="btn btn-primary">
          Zobacz menu
        </Link>
        <Link href="/" className="btn btn-ghost">
          Strona główna
        </Link>
      </div>
    </div>
  );
}

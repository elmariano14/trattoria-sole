import type { Metadata } from "next";
import credits from "@data/image-credits.json";

export const metadata: Metadata = {
  title: "Źródła zdjęć",
  robots: { index: false },
};

export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6 sm:pt-14">
      <h1 className="text-5xl">Źródła zdjęć</h1>
      <p className="mt-4 text-castagna/80">
        To projekt demonstracyjny. Zdjęcia pochodzą z serwisu Unsplash i są używane na{" "}
        <a href="https://unsplash.com/license" className="underline underline-offset-4">
          licencji Unsplash
        </a>
        . Dziękujemy autorom:
      </p>
      <ul className="mt-8 divide-y divide-pane-line border-y border-pane-line">
        {credits.map((c) => (
          <li key={c.file} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3 text-sm">
            <code className="text-muted">{c.file.replace("/images/", "")}</code>
            <span>
              <a href={c.photoUrl} className="underline underline-offset-4">
                zdjęcie
              </a>{" "}
              autorstwa{" "}
              <a href={c.authorUrl} className="font-semibold underline underline-offset-4">
                {c.author}
              </a>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

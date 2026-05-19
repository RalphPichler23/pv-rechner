export function Header() {
  return (
    <header className="border-b border-heizma-border bg-heizma-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Heizma-Wortmarke (Platzhalter mit Marken-Akzent) */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-heizma-ink text-heizma-green">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              aria-hidden
              fill="none"
            >
              <path
                d="M12 2.5 4 7v10l8 4.5L20 17V7l-8-4.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M8 12h4v5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m16 9-4 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight text-heizma-ink">
              Heizma <span className="text-heizma-green">·</span> PV-Rechner
            </div>
            <div className="text-xs text-heizma-muted">
              Amortisation & Ersparnis für Photovoltaik-Anlagen
            </div>
          </div>
        </div>
        <div className="hidden text-right text-xs text-heizma-muted sm:block">
          Internes Tool · für Beratungsgespräche
        </div>
      </div>
    </header>
  );
}

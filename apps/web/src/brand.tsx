export function Brand({ backHref }: { backHref?: string }) {
  return (
    <header className="brand">
      <div className="brand-name">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="3" y="15" width="7" height="13" rx="2" fill="currentColor" />
          <rect x="13" y="9" width="7" height="19" rx="2" fill="currentColor" />
          <rect x="23" y="3" width="7" height="25" rx="2" fill="currentColor" />
        </svg>
        <span>Mi Balance</span>
      </div>
      {backHref && (
        <a className="home-link" href={backHref}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m10 5-7 7 7 7M3 12h18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Volver al inicio
        </a>
      )}
    </header>
  );
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? "brand-light" : ""}`}>
      <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" className="brand-mark">
        <circle cx="23" cy="25" r="18" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="23" cy="25" r="11" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="23" cy="25" r="4.5" stroke="currentColor" strokeWidth="2.4" />
        <path d="M28 20 39 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="40" cy="8" r="3.5" fill="currentColor" />
      </svg>
      <span>JobRadar</span>
    </span>
  );
}

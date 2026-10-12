export function BalanceScene() {
  return (
    <svg
      className="balance-scene"
      viewBox="0 0 420 360"
      aria-hidden="true"
      focusable="false"
    >
      <g className="balance-details" fill="var(--accent)">
        <circle cx="73" cy="113" r="3" />
        <circle cx="102" cy="92" r="2" />
        <circle cx="169" cy="68" r="3" />
        <circle cx="297" cy="88" r="2.5" />
        <circle cx="338" cy="116" r="3" />
        <circle cx="366" cy="149" r="2" />
        <circle cx="45" cy="197" r="2.5" />
        <circle cx="362" cy="272" r="3" />
        <path d="m231 91 5-5 5 5-5 5Z" />
        <path d="m62 272 4-4 4 4-4 4Z" />
        <path
          d="M325 58v10m-5-5h10"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <ellipse
        cx="210"
        cy="314"
        rx="146"
        ry="9"
        fill="var(--accent)"
        opacity=".08"
      />
      <path d="M155 300a55 55 0 0 1 110 0Z" fill="var(--accent)" />
      <g className="balance-beam">
        <circle cx="118" cy="187" r="38" fill="var(--accent-soft)" />
        <path d="M259 225v-30a32 32 0 0 1 64 0v30Z" fill="var(--ink)" />
        <rect
          x="60"
          y="225"
          width="300"
          height="20"
          rx="10"
          fill="var(--illustration-paper)"
        />
        <path
          d="M76 235h268"
          stroke="var(--accent)"
          strokeWidth="1"
          opacity=".2"
        />
      </g>
    </svg>
  );
}

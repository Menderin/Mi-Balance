type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  disabled: boolean;
  autoComplete: "current-password" | "new-password";
  onChange: (value: string) => void;
  onToggle: () => void;
};

export function PasswordField({
  id,
  label,
  value,
  visible,
  disabled,
  autoComplete,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-control">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={8}
          maxLength={128}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
        <button
          className="visibility-button"
          type="button"
          aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`}
          aria-controls={id}
          aria-pressed={visible}
          onClick={onToggle}
          disabled={disabled}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </div>
    </div>
  );
}

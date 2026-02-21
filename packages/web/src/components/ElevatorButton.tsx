interface ElevatorButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
  ariaLabel?: string;
}

export function ElevatorButton({
  label,
  active,
  onClick,
  color,
  ariaLabel,
}: ElevatorButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`group relative w-16 h-16 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-xs font-semibold uppercase tracking-wider cursor-pointer
        ${
          active
            ? "border-current shadow-[0_0_20px_currentColor] scale-110"
            : "border-olive-400 text-olive-600 hover:border-olive-600 hover:text-olive-950"
        }`}
      style={active && color ? { color } : undefined}
    >
      {label}
      {active && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 border-2 border-current" />
      )}
    </button>
  );
}

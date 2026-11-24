type PointerArrowProps = {
  color: string;
  topPercent: number;
  visible: boolean;
};

export function PointerArrow({ color, topPercent, visible }: PointerArrowProps) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute left-2 z-10 -translate-y-1/2 drop-shadow"
      style={{ top: `${topPercent * 100}%`, color }}
      aria-hidden
    >
      <svg width="18" height="22" viewBox="0 0 18 22" fill="currentColor">
        <path d="M0 0 L18 11 L0 22 Z" />
      </svg>
    </div>
  );
}

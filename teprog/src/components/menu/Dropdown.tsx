import { useEffect, useRef, useState, type ReactNode } from "react";

export type DropdownItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type DropdownProps = {
  label: string;
  items: DropdownItem[];
  children?: ReactNode;
};

export function Dropdown({ label, items, children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="rounded-md px-3 py-1.5 text-sf hover:bg-white/10"
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>
      {open ? (
        <div className="absolute left-0 z-40 mt-1 min-w-48 rounded-md border border-current/20 bg-bg_dark py-1 shadow-xl">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              className="block w-full px-3 py-2 text-left text-sf hover:bg-white/10 disabled:opacity-40"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
          {children}
        </div>
      ) : null}
    </div>
  );
}

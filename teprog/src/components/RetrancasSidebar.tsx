import type { Lauda } from "../types/script";

type RetrancasSidebarProps = {
  laudas: Lauda[];
  programName: string | null;
  selectedId: string | null;
  onSelect: (lauda: Lauda) => void;
  onSelectStart: () => void;
};

export function RetrancasSidebar({
  laudas,
  programName,
  selectedId,
  onSelect,
  onSelectStart,
}: RetrancasSidebarProps) {
  const atStart = selectedId === null;
  const ordered = [...laudas].sort((a, b) => a.order - b.order);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-current/20 bg-bg_dark">
      <header className="border-b border-current/15 px-4 py-3">
        <h2 className="text-sf font-semibold">Retrancas</h2>
        <p className="mt-1 text-xs opacity-70">
          Salte para um tema do roteiro (RETRANCA).
        </p>
        {programName ? (
          <p className="mt-2 truncate text-xs font-medium opacity-90">
            {programName}
          </p>
        ) : null}
      </header>

      <div className="scrollbar-sm min-h-0 flex-1 overflow-y-auto p-2">
        {ordered.length === 0 ? (
          <p className="px-2 py-6 text-center text-sf opacity-70">
            Nenhuma lauda. Importe um roteiro em File.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            <li>
              <button
                type="button"
                className={`w-full rounded-md px-3 py-2 text-left text-sf ${
                  atStart
                    ? "bg-bg_white text-w_font"
                    : "hover:bg-white/10"
                }`}
                aria-current={atStart ? "true" : undefined}
                onClick={onSelectStart}
              >
                <span className="block truncate font-medium">
                  Início do roteiro
                </span>
                <span className="block text-xs opacity-70">
                  Acompanhar desde o começo
                </span>
              </button>
            </li>

            {ordered.map((lauda) => {
              const selected = lauda.id === selectedId;
              const presenter = lauda.presenter?.trim() || "/////";

              return (
                <li key={lauda.id}>
                  <button
                    type="button"
                    data-first-line-id={lauda.first_line_id ?? undefined}
                    className={`w-full rounded-md px-3 py-2 text-left text-sf ${
                      selected
                        ? "bg-bg_white text-w_font"
                        : "hover:bg-white/10"
                    }`}
                    aria-current={selected ? "true" : undefined}
                    onClick={() => onSelect(lauda)}
                  >
                    <span className="block truncate font-medium">
                      {lauda.title}
                    </span>
                    <span className="block text-xs opacity-70">
                      {lauda.id} · {presenter}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

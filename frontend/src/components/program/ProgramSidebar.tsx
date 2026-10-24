import { useEffect, useState } from "react";
import { listProgramNames } from "../../lib/slugsStorage";

type ProgramSidebarProps = {
  selected: string | null;
  onSelect: (programName: string) => void;
};

export function ProgramSidebar({
  selected,
  onSelect,
}: ProgramSidebarProps) {
  const [names, setNames] = useState<string[]>(() =>
    listProgramNames(),
  );

  useEffect(() => {
    function refresh() {
      setNames(listProgramNames());
    }

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("slugs-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("slugs-updated", refresh);
    };
  }, []);

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-3 border-r border-current/15 pr-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide opacity-80">
        Programas
      </h2>

      {names.length === 0 ? (
        <p className="text-sm opacity-70">
          Importe um roteiro em File → Import.
        </p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {names.map((name) => {
            const isSelected = name === selected;
            return (
              <li key={name}>
                <button
                  type="button"
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-w_font text-bg_white dark:bg-d_font dark:text-bg_dark"
                      : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => onSelect(name)}
                >
                  {name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

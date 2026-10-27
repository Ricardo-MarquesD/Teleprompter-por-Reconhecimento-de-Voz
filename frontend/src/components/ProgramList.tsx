import type { ScriptBlockItem } from "../lib/scriptModel";

type ProgramListProps = {
  blocks: ScriptBlockItem[];
  selectedId: string | null;
  onSelect: (item: ScriptBlockItem) => void;
};

export function ProgramList({
  blocks,
  selectedId,
  onSelect,
}: ProgramListProps) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-current/20">
      <header className="border-b border-current/15 px-4 py-3">
        <h2 className="text-sm font-semibold">Programas</h2>
        <p className="mt-1 text-xs opacity-70">
          Blocos com program_name e subblocks do localStorage.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {blocks.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm opacity-70">
            Nenhum bloco em slugs. Importe um roteiro em File.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {blocks.map((item) => {
              const selected = item.id === selectedId;
              const lineCount = item.block.subblocks.reduce(
                (sum, sub) => sum + sub.lines.length,
                0,
              );

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                      selected
                        ? "bg-w_font text-bg_white dark:bg-d_font dark:text-bg_dark"
                        : "hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                    aria-current={selected ? "true" : undefined}
                    onClick={() => onSelect(item)}
                  >
                    <span className="block truncate font-medium">
                      {item.title}
                    </span>
                    <span className="block text-xs opacity-70">
                      {`${item.block.subblocks.length} subbloco${item.block.subblocks.length === 1 ? "" : "s"} · ${lineCount} linha${lineCount === 1 ? "" : "s"}`}
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

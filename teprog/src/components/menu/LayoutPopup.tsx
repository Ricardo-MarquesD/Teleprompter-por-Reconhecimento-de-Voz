import { useState } from "react";
import type { AspectRatio, StyleConfig, TextAlign } from "../../types/style";

type LayoutPopupProps = {
  style: StyleConfig;
  onSave: (style: StyleConfig) => void;
  onClose: () => void;
};

const FONT_OPTIONS = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
];

export function LayoutPopup({ style, onSave, onClose }: LayoutPopupProps) {
  const [draft, setDraft] = useState<StyleConfig>({ ...style });

  const patch = (partial: Partial<StyleConfig>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-current/20 bg-bg_dark p-5 shadow-2xl">
        <h2 className="text-lf font-semibold">Layout do teleprompter</h2>
        <p className="mt-1 text-xs opacity-70">
          Persistido em config_style.json
        </p>

        <div className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sf">
            Fonte
            <select
              className="rounded-md border border-current/25 bg-transparent px-2 py-2"
              value={draft.fontFamily}
              onChange={(e) => patch({ fontFamily: e.target.value })}
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-black">
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sf">
            Tamanho ({draft.fontSizePx}px)
            <input
              type="range"
              min={18}
              max={72}
              value={draft.fontSizePx}
              onChange={(e) => patch({ fontSizePx: Number(e.target.value) })}
            />
          </label>

          <label className="grid gap-1 text-sf">
            Alinhamento
            <select
              className="rounded-md border border-current/25 bg-transparent px-2 py-2"
              value={draft.textAlign}
              onChange={(e) =>
                patch({ textAlign: e.target.value as TextAlign })
              }
            >
              <option value="left" className="text-black">
                Esquerda
              </option>
              <option value="center" className="text-black">
                Centro
              </option>
              <option value="right" className="text-black">
                Direita
              </option>
            </select>
          </label>

          <label className="grid gap-1 text-sf">
            Proporção da tela Ao ar
            <select
              className="rounded-md border border-current/25 bg-transparent px-2 py-2"
              value={draft.aspectRatio}
              onChange={(e) =>
                patch({ aspectRatio: e.target.value as AspectRatio })
              }
            >
              <option value="16:9" className="text-black">
                16:9 (padrão atual)
              </option>
              <option value="4:3" className="text-black">
                4:3 (legado)
              </option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sf">
              Texto
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-md border border-current/25 bg-transparent"
                value={draft.colorNormal}
                onChange={(e) => patch({ colorNormal: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sf">
              Palavra atual
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-md border border-current/25 bg-transparent"
                value={draft.colorCurrent}
                onChange={(e) => patch({ colorCurrent: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sf">
              Falado
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-md border border-current/25 bg-transparent"
                value={draft.colorSpoken}
                onChange={(e) => patch({ colorSpoken: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sf">
              Ponteiro
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-md border border-current/25 bg-transparent"
                value={draft.pointerColor || "#dc2626"}
                onChange={(e) => patch({ pointerColor: e.target.value })}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sf">
            <input
              type="checkbox"
              checked={draft.showPointer}
              onChange={(e) => patch({ showPointer: e.target.checked })}
            />
            Exibir ponteiro (seta na altura dos olhos)
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-current/25 px-4 py-2 text-sf"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-md bg-bg_white px-4 py-2 text-sf text-w_font"
            onClick={() => onSave(draft)}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

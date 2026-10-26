import { useEffect, useState } from "react";
import {
  type AudioInputConfig,
  loadAudioInputConfigs,
  STORAGE_KEY,
} from "../lib/audioInputStorage";

export type { AudioInputConfig };

type AudioInputSettingsProps = {
  open: boolean;
  onClose: () => void;
};

export function AudioInputSettings({
  open,
  onClose,
}: AudioInputSettingsProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [configs, setConfigs] = useState<AudioInputConfig[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setConfigs(loadAudioInputConfigs());
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadDevices() {
      try {
        setError("");

        const permission =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

        permission.getTracks().forEach((track) => track.stop());

        const all =
          await navigator.mediaDevices.enumerateDevices();

        if (!cancelled) {
          setDevices(
            all.filter((device) => device.kind === "audioinput"),
          );
        }
      } catch {
        if (!cancelled) {
          setError(
            "Não foi possível acessar os dispositivos de áudio.",
          );
        }
      }
    }

    void loadDevices();

    return () => {
      cancelled = true;
    };
  }, [open]);

  function update(
    id: string,
    changes: Partial<AudioInputConfig>,
  ) {
    setConfigs((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    );
  }

  function addInput() {
    const device = devices.find(
      (item) =>
        !configs.some(
          (config) => config.deviceId === item.deviceId,
        ),
    );

    if (!device) {
      setError(
        "Não há outro dispositivo disponível para adicionar.",
      );
      return;
    }

    setConfigs((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        deviceId: device.deviceId,
        label: device.label || "Entrada de áudio",
        active: true,
      },
    ]);

    setError("");
  }

  function removeInput(id: string) {
    setConfigs((current) =>
      current.filter((item) => item.id !== id),
    );
  }

  function save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(configs),
      );
      setError("");
      onClose();
    } catch {
      setError("Não foi possível salvar as configurações.");
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-settings-title"
      className="fixed inset-0 z-9999 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-bg_white text-w_font shadow-2xl dark:bg-bg_dark dark:text-d_font"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Cabeçalho */}
        <header className="shrink-0 border-b border-current/15 px-5 py-4 sm:px-6">
          <h2
            id="audio-settings-title"
            className="text-lg font-semibold"
          >
            Entradas de áudio
          </h2>

          <p className="mt-2 text-sm opacity-80">
            Adicione os microfones e marque as entradas que
            deseja utilizar na captura.
          </p>
        </header>

        {/* Conteúdo rolável */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {configs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-current/25 px-4 py-8 text-center">
              <p className="text-sm opacity-80">
                Nenhuma entrada configurada.
              </p>
              <p className="mt-1 text-sm opacity-60">
                Clique em "Adicionar entrada" para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {configs.map((config) => (
                <article
                  key={config.id}
                  className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-current/20 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] lg:items-end"
                >
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm">
                    <span>Dispositivo</span>

                    
                    <select
                    className="w-full min-w-0 rounded-md border border-current/25 bg-bg_white px-3 py-2 text-w_font outline-none focus:ring-2 focus:ring-blue-500 dark:bg-bg_dark dark:text-d_font"
                    value={config.deviceId}
                    onChange={(event) => {
                        const device = devices.find(
                        (item) => item.deviceId === event.target.value,
                        );

                        update(config.id, {
                        deviceId: event.target.value,
                        label: device?.label || "Entrada de áudio",
                        });
                    }}
                    >
                    {devices.length === 0 && (
                        <option value={config.deviceId}>
                        Dispositivo indisponível
                        </option>
                    )}

                    {devices.map((device, index) => (
                        <option
                        key={device.deviceId || index}
                        value={device.deviceId}
                        className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                        >
                        {device.label || `Microfone ${index + 1}`}
                        </option>
                    ))}
                    </select>

                  </label>

                  <label className="flex min-w-0 flex-col gap-1.5 text-sm">
                    <span>Nome da entrada</span>

                    <input
                      className="w-full min-w-0 rounded-md border border-current/25 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      value={config.label}
                      onChange={(event) =>
                        update(config.id, {
                          label: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="flex items-center gap-2 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-blue-600"
                      checked={config.active}
                      onChange={(event) =>
                        update(config.id, {
                          active: event.target.checked,
                        })
                      }
                    />
                    Ativa
                  </label>

                  <button
                    type="button"
                    className="rounded-md px-3 py-2 text-left text-sm text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-950"
                    onClick={() => removeInput(config.id)}
                  >
                    Remover
                  </button>
                </article>
              ))}
            </div>
          )}

          {error && (
            <p
              className="mt-4 wrap-break-word text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        {/* Rodapé */}
        <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-current/15 bg-bg_white px-5 py-4 dark:bg-bg_dark sm:px-6">
          <button
            type="button"
            className="rounded-md border border-current/25 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={addInput}
          >
            Adicionar entrada
          </button>

          <button
            type="button"
            className="rounded-md border border-current/25 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="rounded-md bg-w_font px-4 py-2 text-sm font-medium text-bg_white hover:opacity-80 dark:bg-d_font dark:text-bg_dark"
            onClick={save}
          >
            Salvar configuração
          </button>
        </footer>
      </section>
    </div>
  );
}
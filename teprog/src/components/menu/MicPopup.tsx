import { useEffect, useState } from "react";
import type { DeviceConfig, DeviceInfo, ProcessBootstrap } from "../../types/messages";
import { listDevices, selectDevice } from "../../services/tpApi";

type MicPopupProps = {
  boot: ProcessBootstrap;
  onClose: () => void;
};

export function MicPopup({ boot, onClose }: MicPopupProps) {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selected, setSelected] = useState<DeviceConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listDevices(boot);
        if (cancelled) return;
        setDevices(data.devices);
        setSelected(data.selected);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boot]);

  const onSelect = async (deviceId: number | null) => {
    setSaving(true);
    setError(null);
    try {
      const next = await selectDevice(boot, deviceId);
      setSelected(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-current/20 bg-bg_dark p-5 shadow-2xl">
        <h2 className="text-lf font-semibold">Microfone</h2>
        <p className="mt-1 text-xs opacity-70">
          Salvo em config_device.json pelo tp_process
        </p>

        {error ? (
          <p className="mt-3 text-sf text-red-400">{error}</p>
        ) : null}

        <ul className="mt-4 max-h-72 space-y-1 overflow-y-auto">
          <li>
            <button
              type="button"
              disabled={saving}
              className={`w-full rounded-md px-3 py-2 text-left text-sf ${
                selected?.device_id == null
                  ? "bg-bg_white text-w_font"
                  : "hover:bg-white/10"
              }`}
              onClick={() => onSelect(null)}
            >
              Padrão do sistema
            </button>
          </li>
          {devices.map((device) => (
            <li key={device.id}>
              <button
                type="button"
                disabled={saving}
                className={`w-full rounded-md px-3 py-2 text-left text-sf ${
                  selected?.device_id === device.id
                    ? "bg-bg_white text-w_font"
                    : "hover:bg-white/10"
                }`}
                onClick={() => onSelect(device.id)}
              >
                <span className="block truncate">{device.name}</span>
                <span className="block text-xs opacity-70">
                  id {device.id}
                  {device.is_default ? " · default" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="rounded-md border border-current/25 px-4 py-2 text-sf"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

import { Command, type Child } from "@tauri-apps/plugin-shell";
import type { ProcessBootstrap } from "../types/messages";

type ManagedProcess = {
  child: Child;
  bootstrap: ProcessBootstrap;
};

const managed = new Map<"slug_process" | "tp_process", ManagedProcess>();

function tryParseBootstrap(line: string): ProcessBootstrap | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed) as ProcessBootstrap;
    if (
      (parsed.service === "slug_process" || parsed.service === "tp_process") &&
      typeof parsed.port === "number" &&
      typeof parsed.token === "string"
    ) {
      return parsed;
    }
  } catch {
    /* ignore non-json lines */
  }
  return null;
}

async function spawnService(
  service: "slug_process" | "tp_process",
  sidecarName: string,
): Promise<ProcessBootstrap> {
  await stopService(service);

  const command = Command.sidecar(sidecarName);
  let resolveBootstrap: (value: ProcessBootstrap) => void;
  let rejectBootstrap: (reason?: unknown) => void;
  const bootstrapPromise = new Promise<ProcessBootstrap>((resolve, reject) => {
    resolveBootstrap = resolve;
    rejectBootstrap = reject;
  });

  let settled = false;
  const settle = (fn: () => void) => {
    if (settled) return;
    settled = true;
    fn();
  };

  const timeout = window.setTimeout(() => {
    settle(() =>
      rejectBootstrap(new Error(`Timeout ao iniciar ${service} (stdout sem JSON)`)),
    );
  }, 60_000);

  const onLine = (line: string) => {
    const boot = tryParseBootstrap(line);
    if (!boot) return;
    window.clearTimeout(timeout);
    settle(() => resolveBootstrap(boot));
  };

  command.stdout.on("data", onLine);
  command.stderr.on("data", onLine);
  command.on("error", (error) => {
    window.clearTimeout(timeout);
    settle(() => rejectBootstrap(error));
  });
  command.on("close", (data) => {
    managed.delete(service);
    if (!settled) {
      window.clearTimeout(timeout);
      settle(() =>
        rejectBootstrap(
          new Error(`${service} encerrou antes do bootstrap (code=${data.code})`),
        ),
      );
    }
  });

  const child = await command.spawn();
  const bootstrap = await bootstrapPromise;
  managed.set(service, { child, bootstrap });
  return bootstrap;
}

export async function startSlugProcess(): Promise<ProcessBootstrap> {
  return spawnService("slug_process", "binaries/slug_process");
}

export async function startTpProcess(): Promise<ProcessBootstrap> {
  return spawnService("tp_process", "binaries/tp_process");
}

export function getBootstrap(
  service: "slug_process" | "tp_process",
): ProcessBootstrap | null {
  return managed.get(service)?.bootstrap ?? null;
}

export async function stopService(
  service: "slug_process" | "tp_process",
): Promise<void> {
  const entry = managed.get(service);
  if (!entry) return;
  managed.delete(service);
  try {
    await entry.child.kill();
  } catch {
    /* already dead */
  }
}

export async function stopAllProcesses(): Promise<void> {
  await Promise.all([stopService("slug_process"), stopService("tp_process")]);
}

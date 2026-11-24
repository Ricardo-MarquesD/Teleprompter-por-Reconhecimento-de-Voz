import type {
  ProcessBootstrap,
  TpIncoming,
  TpOutgoing,
} from "../types/messages";

export type TpWsHandlers = {
  onMessage: (msg: TpOutgoing) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
};

export class TpWebSocket {
  private ws: WebSocket | null = null;

  connect(boot: ProcessBootstrap, handlers: TpWsHandlers): void {
    this.close();
    const url = `ws://${boot.host}:${boot.port}/ws/teleprompter?token=${encodeURIComponent(boot.token)}`;
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => handlers.onOpen?.();
    ws.onclose = () => handlers.onClose?.();
    ws.onerror = (event) => handlers.onError?.(event);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as TpOutgoing;
        handlers.onMessage(msg);
      } catch {
        /* ignore */
      }
    };
  }

  send(message: TpIncoming): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket do teleprompter não está conectado");
    }
    this.ws.send(JSON.stringify(message));
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  close(): void {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      try {
        this.ws.close();
      } catch {
        /* ignore */
      }
      this.ws = null;
    }
  }
}

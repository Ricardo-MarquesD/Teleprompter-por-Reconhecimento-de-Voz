export type ProcessBootstrap = {
  service: "slug_process" | "tp_process";
  host: string;
  port: number;
  token: string;
};

export type PositionOut = {
  type: "position";
  word_id: number;
  word_line_id: number;
  line_id: string;
};

export type StatusOut = {
  type: "status";
  state: "improvising" | "tracking";
};

export type ErrorOut = {
  type: "error";
  detail: string;
};

export type TpOutgoing = PositionOut | StatusOut | ErrorOut;

export type OperationalIn = {
  type: "operational";
  state: boolean;
  line_id?: string | null;
};

export type PositionJumpIn = {
  type: "position";
  line_id: string;
  page?: string | null;
  is_page_jump?: boolean;
};

export type TpIncoming = OperationalIn | PositionJumpIn;

export type DeviceInfo = {
  id: number;
  name: string;
  channels: number;
  default_samplerate: number;
  is_default: boolean;
};

export type DeviceConfig = {
  device_id: number | null;
  name: string;
  sample_rate: number;
  channels: number;
};

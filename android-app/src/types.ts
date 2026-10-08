export type CaptureType = 'rfid' | 'barcode' | 'qr';
export type Operation = 'read' | 'write';

export interface ScanItem {
  id: string;
  captureType: CaptureType;
  operation: Operation;
  epc?: string;
  tid?: string;
  userData?: string;
  rssi?: string;
  readCount: number;
  barcodeValue?: string;
  symbology?: string;
  capturedAt: string;
  /** cmn_location sys_id of the room selected when the item was captured. */
  location?: string;
  /** x_snc_nowrfid_asset_type sys_id; empty = classify later in ServiceNow. */
  assetType?: string;
  /** alm_stockroom sys_id when the destination is an almoxarifado (asset goes "em estoque"). */
  stockroom?: string;
  /** cmdb_model sys_id chosen by the operator; empty = the type's default model. */
  model?: string;
  /** Número de patrimônio of an existing plaqueta paired with this tag (vincular). */
  assetTag?: string;
  /** What ServiceNow did with the item after the batch was sent. */
  outcome?: ItemOutcome;
  raw: Record<string, unknown>;
}

export interface ItemOutcome {
  status: 'created' | 'existing' | 'matched' | 'pending' | 'error';
  assetTag?: string;
  message: string;
}

export type BatchStatus = 'open' | 'sending' | 'sent' | 'error';

export interface ScanBatch {
  id: string;
  createdAt: string;
  notes: string;
  items: ScanItem[];
  status: BatchStatus;
  sentAt?: string;
  serverNumber?: string;
  lastError?: string;
}

export type AuthMode = 'oauth' | 'basic';

export interface Settings {
  instanceUrl: string;
  apiPath: string;
  authMode: AuthMode;
  username: string;
  password: string;
  clientId: string;
  clientSecret: string;
  debugEnabled: boolean;
  includeTid: boolean;
  /** R6 output power in dBm (5–30), saved and re-applied on every connect. */
  readPower: number;
  lastDeviceAddress: string;
  lastDeviceName: string;
  installId: string;
}

export const DEFAULT_SETTINGS: Settings = {
  instanceUrl: '',
  apiPath: '/api/x_snc_nowrfid/nowrfid',
  authMode: 'basic',
  username: '',
  password: '',
  clientId: '',
  clientSecret: '',
  debugEnabled: true,
  includeTid: true,
  readPower: 30,
  lastDeviceAddress: '',
  lastDeviceName: '',
  installId: '',
};

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export const LEGACY_API_PATH = '/api/x_nowrfid/nowrfid';

/** Node of the cmn_location tree served by GET /structure. */
export interface LocationNode {
  sys_id: string;
  name: string;
  /** Raw cmn_location_type value: site, building/structure, floor, room... */
  type: string;
  parent: string;
  full_name: string;
  active: boolean;
  /** 'entity' for unidades (they own the rooms); empty otherwise. */
  kind?: string;
}

export interface Stockroom {
  sys_id: string;
  name: string;
  location: string;
  location_name: string;
}

export interface Structure {
  root: string;
  serverTime: string;
  syncedAt: string;
  locations: LocationNode[];
  stockrooms?: Stockroom[];
}

/** Conta contábil SIAF (u_siaf_codigos). */
export interface SiafCode {
  sys_id: string;
  code: string;
  description: string;
  life_years: number | null;
  residual_pct: number | null;
}

export interface AssetModel {
  sys_id: string;
  name: string;
  /** u_siaf_codigos sys_id. */
  siaf: string;
  assets: number;
}

export interface AssetType {
  sys_id: string;
  name: string;
  icon: string;
  order: number;
  asset_class?: string;
  /** Predominant SIAF account (sys_id) of the category. */
  siaf?: string;
  default_model?: string;
  models?: AssetModel[];
  siaf_codes?: SiafCode[];
}

/** New asset (ServiceNow issues the número de patrimônio) or existing one with a plaqueta to pair. */
export type CaptureMode = 'new' | 'existing';

/** What the operator selected before starting the scanner. */
export interface CaptureContext {
  /** cmn_location sys_id (for a stockroom: the stockroom's location). */
  location: string;
  locationPath: string[];
  assetType?: string;
  stockroom?: string;
  model?: string;
  mode?: CaptureMode;
}

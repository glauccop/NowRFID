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
  raw: Record<string, unknown>;
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
}

export interface Structure {
  root: string;
  serverTime: string;
  syncedAt: string;
  locations: LocationNode[];
}

export interface AssetType {
  sys_id: string;
  name: string;
  icon: string;
  order: number;
}

/** What the operator selected before starting the scanner. */
export interface CaptureContext {
  location: string;
  locationPath: string[];
  assetType?: string;
}

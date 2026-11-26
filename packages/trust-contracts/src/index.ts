export type VendorEngineId = "chromium-v8" | "firefox-gecko" | "edge-chromium";

export interface VendorEngineSpec {
  id: VendorEngineId;
  browser: string;
  core: string;
  pathway: string;
  status: "Verified" | "Active Channel";
}

export const MULTI_VENDOR_ENGINES: VendorEngineSpec[] = [
  {
    id: "chromium-v8",
    browser: "Google Chrome / Chromium",
    core: "V8 Engine Footprint",
    pathway: "Default standard WebSocket & telemetry HUD baseline",
    status: "Verified"
  },
  {
    id: "firefox-gecko",
    browser: "Mozilla Firefox",
    core: "Native Gecko Protocol Core",
    pathway: "Gecko automation & DOM compatibility profile",
    status: "Verified"
  },
  {
    id: "edge-chromium",
    browser: "Microsoft Edge",
    core: "Vendor-Native Chromium Channel",
    pathway: "Custom execution pathway via Edge WebDriver/channel",
    status: "Active Channel"
  }
];

export interface TrustStateSummary {
  ledger_valid: boolean;
  ledger_entries: number;
  sandboxes: {
    prod_active: number;
    staging_shadow: number;
    quarantine_vault: number;
  };
}

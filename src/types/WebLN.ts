import { GetInfoResponse, WebLNProvider } from "webln";

export type WebLNNetwork = "lightning";

export type WebLNRequestMethod =
  | "getinfo"
  | "listchannels"
  | "listinvoices"
  | "channelbalance"
  | "walletbalance"
  | "openchannel"
  | "connectpeer"
  | "disconnectpeer"
  | "estimatefee"
  | "getchaninfo"
  | "getnetworkinfo"
  | "getnodeinfo"
  | "gettransactions"
  | "listpayments"
  | "listpeers"
  | "lookupinvoice"
  | "queryroutes"
  | "verifymessage"
  | "sendtoroute"
  | "decodepayreq"
  | "routermc"
  | "addinvoice";

// TODO: create a PR for the webln repo
export type ExtendedGetInfoResponse = GetInfoResponse & {
  version: string;
  supports: WebLNNetwork[];
  methods: WebLNRequestMethod[];
};

export type ListInvoicesResponse = {
  invoices: {
    memo: string;
    r_preimage: string;
    r_hash: string;
    value: string;
    value_msat: string;
    settled: boolean;
    creation_date: string;
    settle_date: string;
    payment_request: string;
    description_hash: string;
    expiry: string;
    fallback_addr: string;
    cltv_expiry: string;
    route_hints: unknown;
    private: boolean;
    add_index: string;
    settle_index: string;
    amt_paid: string;
    amt_paid_sat: string;
    amt_paid_msat: string;
    state: "SETTLED" | "CANCELED" | string;
    is_keysend: boolean;
    payment_addr: string;
    is_amp: false;
    amp_invoice_state: {};
    htlcs: {
      chan_id: string;
      htlc_index: string;
      amt_msat: string;
      accept_height: number;
      accept_time: string;
      resolve_time: string;
      expiry_height: number;
      state: "SETTLED" | "CANCELED" | string;
      custom_records: { [key: string]: string };
      mpp_total_amt_msat: string;
      amp: unknown;
    }[];
    features: { [key: string]: unknown };
  }[];
  last_index_offset: string;
  first_index_offset: string;
};

export type ListInvoicesRequestFunc = (
  method: "listinvoices",
  args?: {
    reversed?: boolean;
    num_max_invoices?: number;
    index_offset?: number;
    pending_only?: boolean;
    creation_date_start?: number;
    creation_date_end?: number;
  }
) => ListInvoicesResponse;

export type ExtendedWebLNProvider = WebLNProvider & {
  request: ListInvoicesRequestFunc &
    ((method: WebLNRequestMethod, args?: unknown) => unknown);
};

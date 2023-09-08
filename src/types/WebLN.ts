import { WebLNProvider } from "@webbtc/webln-types";

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
  request: ListInvoicesRequestFunc & WebLNProvider["request"];
};

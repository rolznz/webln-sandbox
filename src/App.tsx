import "./App.css";

import { GetInfoResponse, requestProvider, WebLNProvider } from "webln";
import React from "react";
import { Loading } from "./components/Loading";

type WebLNNetwork = "lightning";

type WebLNRequestMethod =
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
type ExtendedGetInfoResponse = GetInfoResponse & {
  version: string;
  supports: WebLNNetwork[];
  methods: WebLNRequestMethod[];
};

type ListInvoicesResponse = {
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

type ListInvoicesRequestFunc = (
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

type ExtendedWebLNProvider = WebLNProvider & {
  request: ListInvoicesRequestFunc &
    ((method: WebLNRequestMethod, args?: unknown) => unknown);
};

function App() {
  const [webln, setWebln] = React.useState<ExtendedWebLNProvider | undefined>();
  const [nodeInfo, setNodeInfo] = React.useState<
    ExtendedGetInfoResponse | undefined
  >();
  const [isLoading, setLoading] = React.useState(false);
  const [requestOutput, setRequestOutput] = React.useState<unknown | undefined>(
    undefined
  );
  const [requestError, setRequestError] = React.useState<unknown | undefined>(
    undefined
  );
  const [currentMethod, setCurrentMethod] = React.useState<
    WebLNRequestMethod | undefined
  >(undefined);
  const [boosts, setBoosts] = React.useState<unknown | undefined>(undefined);

  const loadWebln = React.useCallback(() => {
    (async () => {
      setLoading(true);
      try {
        console.log("Loading webln...");
        setWebln((await requestProvider()) as ExtendedWebLNProvider);
        console.log("Webln loaded!");
      } catch (err) {
        console.error(err);
        alert(
          "You don't have webln enabled. Please install the Alby extension."
        );
      }
      setLoading(false);
    })();
  }, []);
  const getNodeInfo = React.useCallback(() => {
    if (!webln) {
      throw new Error("webln not loaded");
    }
    (async () => {
      setLoading(true);
      try {
        const info = (await webln.getInfo()) as ExtendedGetInfoResponse;
        setNodeInfo(info);
        console.log("getInfo", info);
      } catch (error) {
        console.error(error);
        alert("Failed to get info");
      }
      setLoading(false);
    })();
  }, [webln]);

  const readBoosts = React.useCallback(() => {
    if (!webln) {
      throw new Error("webln not loaded");
    }
    (async () => {
      setLoading(true);
      try {
        const response = await webln.request("listinvoices", {
          reversed: true,
          num_max_invoices: 1000,
        });
        const boosts: {}[] = [];
        for (const invoice of response.invoices) {
          for (const htlc of invoice.htlcs) {
            const podcastData = htlc.custom_records?.["7629169"];
            if (podcastData) {
              boosts.push(JSON.parse(atob(podcastData)));
            }
          }
        }

        setBoosts(boosts);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    })();
  }, [webln]);

  return (
    <div className="p-4 flex flex-col gap-4 items-center justify-center min-h-full container">
      <h1 className="text-lg p-0 m-0">WebLN sandbox</h1>
      {!webln ? (
        isLoading ? (
          <Loading />
        ) : (
          <button className="btn btn-primary" onClick={loadWebln}>
            Connect WebLN
          </button>
        )
      ) : (
        <>
          <div className="flex gap-1 justify-center items-center">
            <span className="badge badge-primary badge-outline badge-sm">
              WebLN loaded
            </span>
            <a
              target="_blank"
              className="flex"
              href="https://www.webln.guide/building-lightning-apps/getting-started"
            >
              <span className="badge badge-secondary badge-sm">docs</span>
            </a>
          </div>
          {!nodeInfo ? (
            isLoading ? (
              <Loading />
            ) : (
              <button className="btn btn-primary" onClick={getNodeInfo}>
                Get node info
              </button>
            )
          ) : (
            <>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Alias</div>
                  <div className="stat-value">{nodeInfo.node.alias}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Color</div>
                  <div
                    className="stat-value drop-shadow"
                    style={{ color: nodeInfo.node.color }}
                  >
                    {nodeInfo.node.color}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">Pubkey</div>
                  <div className="stat-value truncate w-48">
                    {nodeInfo.node.pubkey}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">Version</div>
                  <div className="stat-value">{nodeInfo.version}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Supports</div>
                  <div className="stat-value">{nodeInfo.supports}</div>
                </div>
              </div>
              <div className="container flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <h2 className="font-mono">Supported methods</h2>
                  <div
                    className={`btn-group btn-group-vertical ${
                      isLoading ? " btn-disabled" : undefined
                    }`}
                  >
                    {nodeInfo.methods.map((method) => (
                      <button
                        key={method}
                        className={`btn btn-info font-mono ${
                          method === currentMethod ? "btn-active" : undefined
                        }`}
                        disabled={isLoading}
                        onClick={() => {
                          (async () => {
                            (async () => {
                              setCurrentMethod(method);
                              setRequestError(undefined);
                              setLoading(true);
                              try {
                                const result = await webln.request(method);

                                console.log(method, result);
                                setRequestOutput(result);
                              } catch (error) {
                                console.error(
                                  "Failed to request",
                                  method,
                                  error
                                );
                                setRequestError(error);
                              }
                              setLoading(false);
                            })();
                          })();
                        }}
                      >
                        {method}
                        {currentMethod === method && isLoading && (
                          <>
                            &nbsp;
                            <Loading />
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex gap-1 flex-row-reverse">
                    <a
                      target="_blank"
                      href="https://lightning.engineering/api-docs/api/lnd/lightning"
                    >
                      <span className="badge badge-secondary badge-sm">
                        LND
                      </span>
                    </a>
                    <a target="_blank" href="https://lightning.readthedocs.io/">
                      <span className="badge badge-secondary badge-sm">
                        CLN
                      </span>
                    </a>
                  </div>
                  <div className="mockup-code flex-1">
                    <pre
                      className={`${requestError ? "text-error" : undefined}`}
                    >
                      <code className="break-words">
                        {requestError ? (
                          JSON.stringify(
                            requestError,
                            Object.getOwnPropertyNames(requestError),
                            2
                          )
                        ) : requestOutput ? (
                          JSON.stringify(requestOutput, null, 2)
                        ) : (
                          <>Click a method to get started.</>
                        )}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-between container">
                <h2>Podcast Data</h2>

                <a
                  target="_blank"
                  className="flex"
                  href="https://github.com/Podcastindex-org/podcast-namespace/blob/main/value/value.md"
                >
                  <span className="badge badge-secondary badge-sm">docs</span>
                </a>
              </div>
              {!boosts ? (
                isLoading ? (
                  <Loading />
                ) : (
                  <button className="btn btn-primary" onClick={readBoosts}>
                    Read Boosts
                  </button>
                )
              ) : (
                <>{JSON.stringify(boosts)}</>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;

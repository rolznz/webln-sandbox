import { GetInfoResponse, RequestMethod } from "@webbtc/webln-types";
import React from "react";
import { loadAccountInfo } from "./Accounts";
import { Loading } from "./Loading";

type MethodExplorerProps = {
  nodeInfo: GetInfoResponse;
};

export function MethodExplorer({ nodeInfo }: MethodExplorerProps) {
  const [isLoading, setLoading] = React.useState(false);
  const [executedCode, setExecutedCode] = React.useState<string | undefined>(
    undefined
  );
  const [requestOutput, setRequestOutput] = React.useState<unknown | undefined>(
    undefined
  );
  const [requestError, setRequestError] = React.useState<unknown | undefined>(
    undefined
  );
  const [currentMethod, setCurrentMethod] = React.useState<
    RequestMethod | undefined
  >(undefined);

  return (
    <>
      <div className="divider mt-8">
        <h1 className="text-lg font-mono">webln.request()</h1>
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
                        if (!window.webln) {
                          throw new Error("WebLN is not available");
                        }
                        const { args, cancelled } = getArgs(method);
                        if (!cancelled) {
                          const result = await window.webln.request(
                            method,
                            args
                          );

                          console.log(method, result);
                          const executedCode = `await window.webln.enable();\nawait window.webln.request("${method}"${
                            args ? ", " + JSON.stringify(args) : ""
                          });`;
                          setExecutedCode(executedCode);
                          setRequestOutput(result);
                          loadAccountInfo();
                        } else {
                          throw new Error("Cancelled");
                        }
                      } catch (error) {
                        console.error("Failed to request", method, error);
                        setRequestError(error);
                      }
                      setLoading(false);
                    })();
                  })();
                }}
              >
                {method}
                {!getDefaultArgs(method) && (
                  <span className="text-error">!</span>
                )}
                {Object.keys(getDefaultArgs(method) || {}).length > 0 && (
                  <span className="text-info-content">*</span>
                )}
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
              href="https://lightning.engineering/api-docs/api/lnd/rest-endpoints"
            >
              <span className="badge badge-secondary badge-sm">LND</span>
            </a>
            <a target="_blank" href="https://lightning.readthedocs.io/">
              <span className="badge badge-secondary badge-sm">CLN</span>
            </a>
          </div>
          <div className="mockup-code flex-1">
            {executedCode && (
              <div className="mb-4">
                {executedCode.split("\n").map((line, index) => (
                  <pre
                    key={index}
                    className={`${
                      requestError ? "text-error" : "text-success"
                    }`}
                  >
                    <code className="break-words">{line}</code>
                  </pre>
                ))}
              </div>
            )}

            {requestError ? (
              <pre className={`${requestError ? "text-error" : undefined}`}>
                <code className="break-words">
                  {JSON.stringify(
                    requestError,
                    Object.getOwnPropertyNames(requestError),
                    2
                  )}
                </code>
              </pre>
            ) : requestOutput ? (
              JSON.stringify(requestOutput, null, 2)
                .split("\n")
                .map((line, index) => (
                  <pre
                    key={index}
                    className={`${requestError ? "text-error" : "text-info"}`}
                  >
                    <code className="break-words">{line}</code>
                  </pre>
                ))
            ) : (
              <pre>
                <code className="break-words">
                  Click a method to get started.
                </code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function getArgs(method: RequestMethod) {
  let defaultArgs = getDefaultArgs(method);
  if (JSON.stringify(defaultArgs) === "{}") {
    defaultArgs = undefined;
  }

  let args;
  if (defaultArgs) {
    args = window.prompt("Args", JSON.stringify(defaultArgs)) || "";
  }

  return {
    args: args ? JSON.parse(args) : undefined,
    cancelled: defaultArgs && !args,
  };
}

function getDefaultArgs(method: RequestMethod) {
  switch (method) {
    case "getinfo":
    case "getnetworkinfo":
    case "channelbalance":
    case "getnodeinfo":
    case "listchannels":
    case "walletbalance":
    case "listpeers":
    case "listinvoices":
    case "gettransactions":
    case "listpayments":
      return {};
    case "queryroutes":
      return {
        amt: 500,
        pub_key:
          "03147d26d4c6cfa2add79543bb62d08b11e58e3f13939fbd1487ad620f117ba7e3",
      };
    case "connectpeer":
      return {
        addr: {
          pubkey:
            "03147d26d4c6cfa2add79543bb62d08b11e58e3f13939fbd1487ad620f117ba7e3",
          host: "localhost:8082",
        },
      };
  }
}

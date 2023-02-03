import { GetInfoResponse, RequestMethod } from "@webbtc/webln-types";
import classNames from "classnames";
import React from "react";
import { DefaultValues, Path, useForm, UseFormRegister } from "react-hook-form";
import { loadAccountInfo } from "./Accounts";
import { Loading } from "./Loading";

type MethodExplorerProps = {
  nodeInfo: GetInfoResponse;
};

export function MethodExplorer({ nodeInfo }: MethodExplorerProps) {
  const [isLoading, setLoading] = React.useState(false);
  const [isModalOpen, setModalOpen] = React.useState(false);
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
  const [modalResolve, setModalResolve] = React.useState<
    ((value: unknown) => void) | undefined
  >(undefined);
  const [cancelInputArguments, setCancelInputArguments] = React.useState<
    (() => void) | undefined
  >(undefined);

  return (
    <>
      {currentMethod && (
        <ArgumentsFormModal
          key={currentMethod}
          currentMethod={currentMethod}
          isModalOpen={isModalOpen}
          modalResolve={modalResolve}
          cancelInputArguments={cancelInputArguments}
        />
      )}
      <div className="divider mt-8">
        <h1 className="text-lg font-mono">webln.request()</h1>
      </div>
      <p>
        Leverage the full potential of your connected node. Currently only LND
        nodes are supported.
      </p>
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
                    setCurrentMethod(method);
                    setRequestError(undefined);
                    setLoading(true);
                    try {
                      if (!window.webln) {
                        throw new Error("WebLN is not available");
                      }
                      async function getArgsFromModal() {
                        let args = undefined;
                        try {
                          args = await new Promise((resolve, reject) => {
                            setModalResolve(() => resolve);
                            setCancelInputArguments(() => reject);
                          });
                        } catch (error) {
                          console.error(error);
                        }
                        setModalOpen(false);
                        return args;
                      }
                      const { args, cancelled } = await getArgs(
                        method,
                        setModalOpen,
                        getArgsFromModal
                      );
                      if (!cancelled) {
                        const executedCode = `await window.webln.enable();\nawait window.webln.request("${method}"${
                          args ? ", " + JSON.stringify(args) : ""
                        });`;
                        setExecutedCode(executedCode);
                        setRequestOutput(undefined);
                        const result = await window.webln.request(method, args);

                        console.log(method, result);
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
              <span className="badge badge-secondary badge-sm">
                LND REST docs
              </span>
            </a>
            {/*<a target="_blank" href="https://lightning.readthedocs.io/">
              <span className="badge badge-secondary badge-sm">CLN</span>
                </a>*/}
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

async function getArgs(
  method: RequestMethod,
  setModalOpen: (isOpen: boolean) => void,
  getArgsFromModal: () => Promise<unknown>
) {
  let defaultArgs = getDefaultArgs(method);
  if (Object.keys(defaultArgs || {}).length === 0) {
    defaultArgs = undefined;
  }

  let args;
  if (defaultArgs) {
    setModalOpen(true);
    args = await getArgsFromModal();
    if (args) {
      if (method === "openchannel") {
        const typedArgs = args as typeof defaultArgs;
        typedArgs.node_pubkey = hexToBase64(typedArgs.node_pubkey!);
      }
    }
  }

  return {
    args,
    cancelled: defaultArgs && !args,
  };
}

//https://stackoverflow.com/a/41797377/4562693
function hexToBase64(hexstring: string) {
  return btoa(
    hexstring
      .match(/\w{2}/g)!
      .map(function (a) {
        return String.fromCharCode(parseInt(a, 16));
      })
      .join("")
  );
}

function getDefaultArgs(method: RequestMethod) {
  return (() => {
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
            host: "alice:8080",
          },
          perm: true,
          timeout: 10,
        };
      case "disconnectpeer":
        return {
          pub_key:
            "03f761d4db6fd17947694d795625310631b9af1df589f1e2f844b74c13caeecab4",
        };
      case "openchannel":
        return {
          node_pubkey:
            "028194cc50c8824b4ca473a5b1296c440a82fb8837a3945b2f55a903d4c380f597",
          local_funding_amount: 100000, // in sats
          push_sat: 0,
        };
    }
  })();
}

type ArgumentsFormModalProps = {
  isModalOpen: boolean;
  currentMethod: RequestMethod;
  modalResolve: ((args: unknown) => void) | undefined;
  cancelInputArguments: (() => void) | undefined;
};

function ArgumentsFormModal({
  isModalOpen,
  currentMethod,
  modalResolve,
  cancelInputArguments,
}: ArgumentsFormModalProps) {
  const defaultValues = React.useMemo(
    () => getDefaultArgs(currentMethod)!,
    [currentMethod]
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<typeof defaultValues>({
    defaultValues,
  });

  const onSubmit = (data: unknown) => {
    console.log(data);
    modalResolve?.(fixTypes(data, defaultValues));
  };

  return (
    <div className={classNames("modal", { "modal-open": isModalOpen })}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Arguments for {currentMethod}</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          {generateFormInputs<typeof defaultValues>(
            defaultValues,
            "",
            register
          )}
          {/* errors will return when field validation fails  */}
          {errors &&
            Object.values(errors).map((error, index) => (
              <span key={index}>{JSON.stringify(error)}</span>
            ))}

          <input className="btn" type="submit" />
          <button className="btn btn-secondary" onClick={cancelInputArguments}>
            cancel
          </button>
        </form>
      </div>
    </div>
  );
}

function generateFormInputs<T extends Object>(
  obj: Object,
  key: string,
  register: UseFormRegister<T>
) {
  return Object.entries(obj).map((entry) => (
    <div key={entry[0]} className="flex flex-col gap-1">
      <span>{key + entry[0]}</span>
      {typeof entry[1] === "object" ? (
        generateFormInputs(entry[1], key + entry[0] + ".", register)
      ) : (
        <>
          <input
            defaultValue={entry[1]}
            required
            {...register((key + entry[0]) as Path<T>)}
            className="input input-bordered"
          />
        </>
      )}
    </div>
  ));
}

// all the inputs are strings - convert them back to the correct types by checking the default values
function fixTypes(obj: any, defaultValues: any) {
  Object.entries(obj).forEach((entry) => {
    if (typeof defaultValues[entry[0]] === "object") {
      obj[entry[0]] = fixTypes(entry[1], defaultValues[entry[0]]);
    } else if (typeof defaultValues[entry[0]] === "number") {
      obj[entry[0]] = parseInt(entry[1] as string);
    } else if (typeof defaultValues[entry[0]] === "boolean") {
      obj[entry[0]] = entry[1] === "true";
    }
  });
  console.log("Fix types", obj);
  return obj;
}

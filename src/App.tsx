import "./App.css";

import { Accounts, useAccountsStore } from "./components/Accounts";
import { MethodExplorer } from "./components/MethodExplorer";
import { NodeStats } from "./components/NodeStats";
import { PodcastReader } from "./components/PodcastReader";

function App() {
  const selectedAccount = useAccountsStore((store) => store.selectedAccount);
  return (
    <div className="p-4 flex flex-col gap-4 items-center justify-center min-h-full container">
      <h1 className="text-lg p-0 m-0">WebLN sandbox</h1>
      <a
        target="_blank"
        className="flex"
        href="https://www.webln.guide/building-lightning-apps/getting-started"
      >
        <span className="badge badge-secondary badge-sm">WebLN guide</span>
      </a>
      <Accounts />
      {selectedAccount && (
        <>
          <NodeStats nodeInfo={selectedAccount.info} />
          <div className="divider mt-8">
            <h1 className="text-lg font-mono">webln.lnurl()</h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (window.webln?.lnurl) {
                window.webln.lnurl("rolznz@getalby.com");
              }
            }}
          >
            Send me a tip
          </button>
          <p>
            lnurl can do{" "}
            <a
              className="link"
              href="https://github.com/lnurl/luds"
              target="_blank"
            >
              much more
            </a>
            .{" "}
          </p>
          <div className="flex w-full">
            <div className="flex-1 flex flex-col items-center">
              <div className="divider mt-8">
                <h1 className="text-lg font-mono">webln.makeInvoice()</h1>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  (async () => {
                    if (window.webln) {
                      const result = await window.webln.makeInvoice({
                        amount: 21,
                      });
                      window.prompt("Copy the invoice", result.paymentRequest);
                    }
                  })();
                }}
              >
                Make Invoice
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="divider mt-8">
                <h1 className="text-lg font-mono">webln.sendPayment()</h1>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  (async () => {
                    if (window.webln) {
                      const invoice = await window.prompt("paste an invoice");
                      if (invoice) {
                        const result = await window.webln.sendPayment(invoice);
                        window.alert("preimage: " + result.preimage);
                      }
                    }
                  })();
                }}
              >
                Send Payment
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="divider mt-8">
                <h1 className="text-lg font-mono">webln.signMessage()</h1>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  (async () => {
                    if (window.webln?.signMessage) {
                      const message = window.prompt(
                        "Type a message",
                        "my node will sign this message"
                      );
                      if (message) {
                        const result = await window.webln.signMessage(message);
                        window.prompt(
                          "Signed message signature",
                          result.signature
                        );
                      }
                    }
                  })();
                }}
              >
                Sign Message
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="divider mt-8">
                <h1 className="text-lg font-mono">webln.verifyMessage()</h1>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  alert(
                    "This function is not supported. It seems like there is no real life usecase?"
                  );
                }}
              >
                Verify Message
              </button>
            </div>
          </div>
          <div className="divider mt-8">
            <h1 className="text-lg font-mono">WebLN experiments</h1>
          </div>
          <p></p>
          <p>
            Try the experiments at{" "}
            <a href="https://webln.twentyuno.net/" target="_blank">
              https://webln.twentyuno.net/
            </a>
          </p>

          <MethodExplorer nodeInfo={selectedAccount.info} />
          <PodcastReader />
        </>
      )}
    </div>
  );
}

export default App;

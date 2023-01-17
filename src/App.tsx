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
        <span className="badge badge-secondary badge-sm">docs</span>
      </a>
      <Accounts />
      {selectedAccount && (
        <>
          <NodeStats nodeInfo={selectedAccount.info} />
          <MethodExplorer nodeInfo={selectedAccount.info} />
          <PodcastReader />
        </>
      )}
    </div>
  );
}

export default App;

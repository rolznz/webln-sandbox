import React from "react";
import { requestProvider } from "webln";
import { ExtendedGetInfoResponse, ExtendedWebLNProvider } from "../types/WebLN";

import { create } from "zustand";
import classnames from "classnames";
import { Loading } from "./Loading";
import { NodeStats } from "./NodeStats";
import { MethodExplorer } from "./MethodExplorer";

type Account = {
  info: ExtendedGetInfoResponse;
  webln: ExtendedWebLNProvider;
};

type AccountsStore = {
  readonly accounts: Account[];
  readonly selectedAccount: Account | undefined;
  addAccount(account: Account): void;
  setSelectedAccount(account: Account): void;
};

export const useAccountsStore = create<AccountsStore>((set, get) => ({
  accounts: [],
  selectedAccount: undefined,
  setSelectedAccount: (account: Account) => set({ selectedAccount: account }),
  addAccount: (account: Account) =>
    set({ accounts: [...get().accounts, account], selectedAccount: account }),
}));

export function Accounts() {
  const [isLoading, setLoading] = React.useState(false);
  const accounts = useAccountsStore((store) => store.accounts);
  const selectedAccount = useAccountsStore((store) => store.selectedAccount);
  const loadWebln = React.useCallback(() => {
    (async () => {
      setLoading(true);
      await loadAccountInfo();
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <div className="flex justify-center items-center gap-2">
        Accounts
        <div className="btn-group">
          {accounts.map((account) => (
            <button
              key={account.info.node.pubkey}
              className={`btn btn-info font-mono ${
                account === selectedAccount ? "btn-active" : undefined
              }`}
              disabled={isLoading}
              onClick={() => {
                useAccountsStore.getState().setSelectedAccount(account);
              }}
            >
              {account.info.node.alias}
            </button>
          ))}
        </div>
        <button
          className={classnames("btn btn-primary btn-sm", {
            "btn-disabled": isLoading,
          })}
          onClick={loadWebln}
          disabled={isLoading}
        >
          {isLoading ? <Loading /> : "+"}
        </button>
      </div>
    </>
  );
}

export async function loadAccountInfo() {
  try {
    console.log("Loading webln...");
    const webln = (await requestProvider()) as ExtendedWebLNProvider;
    const info = (await webln.getInfo()) as ExtendedGetInfoResponse;
    if (
      !useAccountsStore
        .getState()
        .accounts.some(
          (account) => account.info.node.pubkey === info.node.pubkey
        )
    ) {
      useAccountsStore.getState().addAccount({
        info,
        webln,
      });
    }

    console.log("Webln loaded!");
  } catch (err) {
    console.error(err);
    alert("Please install the Alby extension.");
  }
}

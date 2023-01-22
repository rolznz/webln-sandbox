import React from "react";

import { create } from "zustand";
import classnames from "classnames";
import { Loading } from "./Loading";
import { GetInfoResponse } from "@webbtc/webln-types";

type Account = {
  info: GetInfoResponse;
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
      <div className="divider mt-8">
        <h1 className="text-lg font-mono">webln.getInfo()</h1>
      </div>
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
  if (!window.webln) {
    alert("Please install the Alby extension");
    return;
  }
  try {
    console.log("Loading webln...");
    await window.webln.enable();
    const info: GetInfoResponse = await window.webln.getInfo();
    if (
      !useAccountsStore
        .getState()
        .accounts.some(
          (account) => account.info.node.pubkey === info.node.pubkey
        )
    ) {
      useAccountsStore.getState().addAccount({
        info,
      });
    }

    console.log("Webln loaded!");
  } catch (err) {
    console.error(err);
    alert((err as Error).message);
  }
}

import React from "react";
import { ExtendedWebLNProvider } from "../types/WebLN";
import { Loading } from "./Loading";

type PodcastReaderProps = {};

export function PodcastReader() {
  const [isLoading, setLoading] = React.useState(false);
  const [boosts, setBoosts] = React.useState<unknown | undefined>(undefined);
  const readBoosts = React.useCallback(() => {
    (async () => {
      setLoading(true);
      try {
        if (!window.webln) {
          throw new Error("webln not loaded");
        }
        const response = await (window.webln as ExtendedWebLNProvider).request(
          "listinvoices",
          {
            reversed: true,
            num_max_invoices: 1000,
          }
        );
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
  }, []);

  return (
    <>
      <div className="divider mt-8">
        <h1 className="text-lg font-mono">V4V</h1>
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
  );
}

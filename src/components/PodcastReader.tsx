import React from "react";
import { ExtendedWebLNProvider } from "../types/WebLN";
import { Loading } from "./Loading";

type PodcastReaderProps = {
  webln: ExtendedWebLNProvider;
};

export function PodcastReader({ webln }: PodcastReaderProps) {
  const [isLoading, setLoading] = React.useState(false);
  const [boosts, setBoosts] = React.useState<unknown | undefined>(undefined);
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
    <>
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

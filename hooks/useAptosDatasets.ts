"use client";

import { useState, useEffect, useCallback } from "react";
import {
  aptos,
  MARKETPLACE_ADDRESS,
  MODULE_NAME,
  DatasetPublic,
  DatasetFull,
  parseDatasetPublic,
} from "@/lib/aptos";

export function useDatasetCount() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const result = await aptos.view({
        payload: {
          function: `${MARKETPLACE_ADDRESS}::${MODULE_NAME}::get_dataset_count`,
          typeArguments: [],
          functionArguments: [MARKETPLACE_ADDRESS],
        },
      });
      setCount(Number(result[0]));
    } catch {
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { count, isLoading, refetch: fetch };
}

export function useDatasets() {
  const [datasets, setDatasets] = useState<DatasetPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const countResult = await aptos.view({
        payload: {
          function: `${MARKETPLACE_ADDRESS}::${MODULE_NAME}::get_dataset_count`,
          typeArguments: [],
          functionArguments: [MARKETPLACE_ADDRESS],
        },
      });
      const count = Number(countResult[0]);
      if (count === 0) { setDatasets([]); return; }

      const fetches = Array.from({ length: count }, (_, i) =>
        aptos.view({
          payload: {
            function: `${MARKETPLACE_ADDRESS}::${MODULE_NAME}::get_dataset_public`,
            typeArguments: [],
            functionArguments: [MARKETPLACE_ADDRESS, i.toString()],
          },
        })
      );
      const results = await Promise.all(fetches);
      setDatasets(results.map((r) => parseDatasetPublic(r)).filter((d) => d.active));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load datasets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { datasets, isLoading, error, refetch: fetch };
}

export function useDataset(id: number) {
  const [dataset, setDataset] = useState<DatasetPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    aptos.view({
      payload: {
        function: `${MARKETPLACE_ADDRESS}::${MODULE_NAME}::get_dataset_public`,
        typeArguments: [],
        functionArguments: [MARKETPLACE_ADDRESS, id.toString()],
      },
    }).then((r) => setDataset(parseDatasetPublic(r)))
      .catch(() => setDataset(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { dataset, isLoading };
}

export function useDatasetBlob(id: number, caller: string | null) {
  const [blobData, setBlobData] = useState<{ blobName: string; shelbyAccount: string } | null>(null);

  useEffect(() => {
    if (!caller) return;
    aptos.view({
      payload: {
        function: `${MARKETPLACE_ADDRESS}::${MODULE_NAME}::get_dataset_blob`,
        typeArguments: [],
        functionArguments: [MARKETPLACE_ADDRESS, id.toString(), caller],
      },
    }).then((r) => {
      setBlobData({ blobName: r[0] as string, shelbyAccount: r[1] as string });
    }).catch(() => setBlobData(null));
  }, [id, caller]);

  return blobData;
}

export function useHasAccess(id: number, user: string | null) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const check = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const result = await aptos.view({
        payload: {
          function: `${MARKETPLACE_ADDRESS}::${MODULE_NAME}::has_access`,
          typeArguments: [],
          functionArguments: [MARKETPLACE_ADDRESS, id.toString(), user],
        },
      });
      setHasAccess(result[0] as boolean);
    } catch {
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => { check(); }, [check]);
  return { hasAccess, isLoading, refetch: check };
}

export function useCreatorDatasets(creator: string | null) {
  const [datasets, setDatasets] = useState<DatasetPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!creator) { setIsLoading(false); return; }

    aptos.view({
      payload: {
        function: `${MARKETPLACE_ADDRESS}::${MODULE_NAME}::get_dataset_count`,
        typeArguments: [],
        functionArguments: [MARKETPLACE_ADDRESS],
      },
    }).then(async (countResult) => {
      const count = Number(countResult[0]);
      const fetches = Array.from({ length: count }, (_, i) =>
        aptos.view({
          payload: {
            function: `${MARKETPLACE_ADDRESS}::${MODULE_NAME}::get_dataset_public`,
            typeArguments: [],
            functionArguments: [MARKETPLACE_ADDRESS, i.toString()],
          },
        })
      );
      const results = await Promise.all(fetches);
      const mine = results
        .map((r) => parseDatasetPublic(r))
        .filter((d) => d.creator.toLowerCase() === creator.toLowerCase());
      setDatasets(mine);
    }).catch(() => setDatasets([]))
      .finally(() => setIsLoading(false));
  }, [creator]);

  return { datasets, isLoading };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api/errors";
import { useToast } from "@/components/toast/use-toast";

interface UseAsyncDataOptions {
  toastOnError?: boolean;
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
  options: UseAsyncDataOptions = {}
) {
  const toast = useToast();
  const { toastOnError = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      if (toastOnError) toast.error(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

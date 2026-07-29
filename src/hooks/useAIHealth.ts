import { useState, useEffect, useCallback } from 'react';
import { checkAIHealth, type HealthResponse } from '../api/ai';

export function useAIHealth(): {
  modelConfigured: boolean;
  loading: boolean;
  refetch: () => void;
} {
  const [modelConfigured, setModelConfigured] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const check = useCallback(() => {
    setLoading(true);
    checkAIHealth()
      .then((res: HealthResponse) => {
        setModelConfigured(res.modelConfigured);
      })
      .catch(() => {
        setModelConfigured(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { modelConfigured, loading, refetch: check };
}

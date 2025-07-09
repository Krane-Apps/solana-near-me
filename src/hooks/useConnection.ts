import { useMemo } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { APP_CLUSTER } from '../config/constants';

export function useConnection() {
  const connection = useMemo(() => {
    return new Connection(clusterApiUrl(APP_CLUSTER as any), 'confirmed');
  }, []);

  return { connection };
} 
import { useMemo } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { SOLANA_CONFIG } from '../lib/utils/constants';
import { logger } from '../lib/utils/logger';

const FILE_NAME = 'useConnection.ts';

export function useConnection() {
  const connection = useMemo(() => {
    logger.info(FILE_NAME, 'Creating Solana connection', { 
      cluster: SOLANA_CONFIG.CLUSTER 
    });
    
    return new Connection(clusterApiUrl(SOLANA_CONFIG.CLUSTER), 'confirmed');
  }, []);

  return { connection };
} 
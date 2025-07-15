import { logger } from './logger';

const FILE_NAME = 'firebaseMetrics.ts';

interface FirebaseOperation {
  type: 'read' | 'write' | 'delete' | 'query';
  collection: string;
  operation: string;
  timestamp: string;
  documentCount?: number;
  queryType?: string;
  cached?: boolean;
}

interface FirebaseMetrics {
  totalReads: number;
  totalWrites: number;
  totalDeletes: number;
  totalQueries: number;
  operationsByCollection: { [collection: string]: number };
  operationsByType: { [type: string]: number };
  sessionOperations: FirebaseOperation[];
  sessionStartTime: string;
}

class FirebaseMetricsTracker {
  private static instance: FirebaseMetricsTracker;
  private metrics: FirebaseMetrics;

  constructor() {
    this.metrics = {
      totalReads: 0,
      totalWrites: 0,
      totalDeletes: 0,
      totalQueries: 0,
      operationsByCollection: {},
      operationsByType: {},
      sessionOperations: [],
      sessionStartTime: new Date().toISOString()
    };
  }

  static getInstance(): FirebaseMetricsTracker {
    if (!FirebaseMetricsTracker.instance) {
      FirebaseMetricsTracker.instance = new FirebaseMetricsTracker();
    }
    return FirebaseMetricsTracker.instance;
  }

  logOperation(operation: Omit<FirebaseOperation, 'timestamp'>) {
    const fullOperation: FirebaseOperation = {
      ...operation,
      timestamp: new Date().toISOString()
    };

    // Add to session operations
    this.metrics.sessionOperations.push(fullOperation);

    // Update counters
    switch (operation.type) {
      case 'read':
        this.metrics.totalReads++;
        break;
      case 'write':
        this.metrics.totalWrites++;
        break;
      case 'delete':
        this.metrics.totalDeletes++;
        break;
      case 'query':
        this.metrics.totalQueries++;
        break;
    }

    // Update collection counters
    if (!this.metrics.operationsByCollection[operation.collection]) {
      this.metrics.operationsByCollection[operation.collection] = 0;
    }
    this.metrics.operationsByCollection[operation.collection]++;

    // Update operation type counters
    if (!this.metrics.operationsByType[operation.operation]) {
      this.metrics.operationsByType[operation.operation] = 0;
    }
    this.metrics.operationsByType[operation.operation]++;

    // Log the operation
    logger.info(FILE_NAME, `🔥 Firebase ${operation.type.toUpperCase()}: ${operation.collection}.${operation.operation}`, {
      documentCount: operation.documentCount,
      queryType: operation.queryType,
      cached: operation.cached,
      totalReads: this.metrics.totalReads,
      totalWrites: this.metrics.totalWrites,
      totalQueries: this.metrics.totalQueries
    });

    // Log summary every 10 operations
    if (this.getTotalOperations() % 10 === 0) {
      this.logSummary();
    }
  }

  logRead(collection: string, operation: string, documentCount: number = 1, cached: boolean = false) {
    this.logOperation({
      type: 'read',
      collection,
      operation,
      documentCount,
      cached
    });
  }

  logWrite(collection: string, operation: string, documentCount: number = 1) {
    this.logOperation({
      type: 'write',
      collection,
      operation,
      documentCount
    });
  }

  logQuery(collection: string, operation: string, documentCount: number = 0, queryType?: string) {
    this.logOperation({
      type: 'query',
      collection,
      operation,
      documentCount,
      queryType
    });
  }

  logDelete(collection: string, operation: string, documentCount: number = 1) {
    this.logOperation({
      type: 'delete',
      collection,
      operation,
      documentCount
    });
  }

  getTotalOperations(): number {
    return this.metrics.totalReads + this.metrics.totalWrites + this.metrics.totalDeletes + this.metrics.totalQueries;
  }

  getMetrics(): FirebaseMetrics {
    return { ...this.metrics };
  }

  logSummary() {
    const sessionDuration = Date.now() - new Date(this.metrics.sessionStartTime).getTime();
    const sessionMinutes = Math.round(sessionDuration / 60000);

    logger.info(FILE_NAME, '📊 Firebase Operations Summary', {
      sessionDuration: `${sessionMinutes} minutes`,
      totalOperations: this.getTotalOperations(),
      reads: this.metrics.totalReads,
      writes: this.metrics.totalWrites,
      queries: this.metrics.totalQueries,
      deletes: this.metrics.totalDeletes,
      operationsByCollection: this.metrics.operationsByCollection,
      topOperations: this.getTopOperations()
    });
  }

  getTopOperations(limit: number = 5) {
    return Object.entries(this.metrics.operationsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([operation, count]) => ({ operation, count }));
  }

  resetMetrics() {
    this.metrics = {
      totalReads: 0,
      totalWrites: 0,
      totalDeletes: 0,
      totalQueries: 0,
      operationsByCollection: {},
      operationsByType: {},
      sessionOperations: [],
      sessionStartTime: new Date().toISOString()
    };
    logger.info(FILE_NAME, '🔄 Firebase metrics reset');
  }

  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Export singleton instance
export const firebaseMetrics = FirebaseMetricsTracker.getInstance();

// Helper function for easy logging
export const logFirebaseOperation = {
  read: (collection: string, operation: string, documentCount?: number, cached?: boolean) => 
    firebaseMetrics.logRead(collection, operation, documentCount, cached),
  
  write: (collection: string, operation: string, documentCount?: number) => 
    firebaseMetrics.logWrite(collection, operation, documentCount),
  
  query: (collection: string, operation: string, documentCount?: number, queryType?: string) => 
    firebaseMetrics.logQuery(collection, operation, documentCount, queryType),
  
  delete: (collection: string, operation: string, documentCount?: number) => 
    firebaseMetrics.logDelete(collection, operation, documentCount)
}; 
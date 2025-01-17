import { DatabaseError, NotFoundError } from '../errors';
import logger from '../utils/logger';

type DatabaseOperation<T> = () => Promise<T>;

export class DatabaseService {
  static async execute<T>(
    operation: DatabaseOperation<T>,
    errorMessage: string = 'Database operation failed'
  ): Promise<T> {
    try {
      const result = await operation();
      
      // Handle null results for queries that should return data
      if (result === null || (Array.isArray(result) && result.length === 0)) {
        throw new NotFoundError('Resource not found');
      }
      
      return result;
    } catch (error) {
      // Log the error with details
      logger.error({
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      // If it's already our custom error, rethrow it
      if (error instanceof NotFoundError) {
        throw error;
      }

      // Otherwise, wrap it in a DatabaseError
      throw new DatabaseError(errorMessage);
    }
  }

  static async executeOrNull<T>(
    operation: DatabaseOperation<T>,
    errorMessage: string = 'Database operation failed'
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      // Log the error with details
      logger.error({
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      throw new DatabaseError(errorMessage);
    }
  }
}

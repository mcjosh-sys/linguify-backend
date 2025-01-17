import { DatabaseError, NotFoundError } from "@/lib/errors";
import  logger  from "@/lib/utils/logger";

type DatabaseOperation<T> = () => Promise<T>;

export class DatabaseService {
  static async execute<T>(
    operation: DatabaseOperation<T>,
    errorMessage: string = 'Database operation failed'
  ): Promise<T> {
    try {
      const result = await operation();
      
      if (!result) {
        throw new NotFoundError(errorMessage);
      }
      
      return result;
    } catch (error) {
      logger.error({
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      if (error instanceof NotFoundError) {
        throw error;
      }

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
      logger.error({
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      throw new DatabaseError(errorMessage);
    }
  }
}

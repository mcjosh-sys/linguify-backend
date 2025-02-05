declare namespace Express {
  interface Request {
    time: Date;
    validatedParams: Record<string, any>;
    validatedQuery: Record<string, any>;
  }
}

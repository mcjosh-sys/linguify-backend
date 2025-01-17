import "dotenv/config";

export const absoluteUrl = (path: string) => {
  return `${process.env.FRONTEND_URL}${path}`;
};

export function filterUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => !!value)
  ) as Partial<T>;
}

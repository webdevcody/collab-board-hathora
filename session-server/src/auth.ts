import jwt from "jsonwebtoken";

export function verifyToken<T>(token: string | undefined, secret: string | undefined): T | null {
  if (token == null || secret == null) {
    return null;
  }
  try {
    return jwt.verify(token, secret) as T;
  } catch (e) {
    return null;
  }
}

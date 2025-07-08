import jwt from "jsonwebtoken";

const JWT_SECRET = getJWTSecret();
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret == null || secret === "") {
    throw new Error("JWT_SECRET is missing");
  }
  return secret;
}

export function verifyToken<T>(token: string | undefined): T | null {
  if (token == null) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (e) {
    return null;
  }
}

import jwt from "jsonwebtoken";

const JWT_SECRET = getJWTSecret();
function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret == null || secret === "") {
    throw new Error("JWT_SECRET is missing");
  }
  return secret;
}

export function verifyToken<T>(token: any): T | null {
  if (typeof token !== "string") {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (e) {
    return null;
  }
}

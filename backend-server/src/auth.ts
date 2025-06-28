import jwt from "jsonwebtoken";

const JWT_SECRET = getJWTSecret();
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret == null || secret === "") {
    throw new Error("JWT_SECRET is missing");
  }
  return secret;
}

export function makeToken(payload: object, secret = JWT_SECRET): string {
  return jwt.sign(payload, secret);
}

export function getUserId(authHeader: string | undefined): string | null {
  const parts = authHeader?.split(" ");
  if (parts?.at(0) === "Bearer" && parts.length === 2) {
    try {
      const payload = jwt.verify(parts[1], JWT_SECRET) as { userId: string };
      return payload.userId;
    } catch {}
  }
  return null;
}

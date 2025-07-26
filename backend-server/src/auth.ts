import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = getJWTSecret();
const SESSION_SERVER_SECRET = getSessionServerSecret();

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret == null || secret === "") {
    throw new Error("JWT_SECRET is missing");
  }
  return secret;
}

function getSessionServerSecret(): string {
  const secret = process.env.SESSION_SERVER_SECRET;
  if (secret == null || secret === "") {
    throw new Error("SESSION_SERVER_SECRET is missing");
  }
  return secret;
}

export function makeToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET);
}

export function makeSessionServerToken(): string {
  return jwt.sign({ sessionServer: true }, SESSION_SERVER_SECRET);
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

export function verifySessionServerToken(
  authHeader: string | undefined
): boolean {
  const parts = authHeader?.split(" ");
  if (parts?.at(0) === "Bearer" && parts.length === 2) {
    try {
      const payload = jwt.verify(parts[1], SESSION_SERVER_SECRET) as {
        sessionServer: boolean;
      };
      return payload.sessionServer === true;
    } catch {}
  }
  return false;
}

// Middleware that accepts both client tokens and session server tokens
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // Check if it's a valid session server token
  if (verifySessionServerToken(authHeader)) {
    // For session server requests, we don't need a userId
    req.userId = null;
    req.isSessionServer = true;
    return next();
  }

  // Check if it's a valid client token
  const userId = getUserId(authHeader);
  if (userId != null) {
    req.userId = userId;
    req.isSessionServer = false;
    return next();
  }

  // Neither token type is valid
  res.sendStatus(401);
}

// Middleware that only accepts client tokens (for user-specific operations)
export function clientAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = getUserId(req.headers.authorization);
  if (userId == null) {
    res.sendStatus(401);
    return;
  }
  req.userId = userId;
  req.isSessionServer = false;
  next();
}

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: string | null;
      isSessionServer?: boolean;
    }
  }
}

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const errorHandlerMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: "Invalid request data",
      details: error.issues
    });
    return;
  }

  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
};

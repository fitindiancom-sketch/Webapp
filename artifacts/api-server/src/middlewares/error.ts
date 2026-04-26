import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request body",
      issues: err.issues,
    });
    return;
  }

  logger.error({ err }, "Request failed");
  const status = typeof err?.status === "number" ? err.status : 500;
  res
    .status(status)
    .json({ message: err?.message ?? "Internal server error" });
};

import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma";
import { AppError } from "../utils/errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", issues: err.issues });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    res.status(409).json({ error: `Duplicate value for ${err.meta?.target ?? "field"}` });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};

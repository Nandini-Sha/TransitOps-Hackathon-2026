import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../../generated/prisma";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

interface TokenPayload {
  sub: string;
  role: Role;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    next(new UnauthorizedError("Not authenticated"));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired session"));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ForbiddenError("Insufficient permissions"));
      return;
    }
    next();
  };
}

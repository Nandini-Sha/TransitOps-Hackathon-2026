import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { UnauthorizedError, ConflictError } from "../../utils/errors";
import { Role } from "../../../generated/prisma";

const TOKEN_TTL = "8h";
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError("Invalid email or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError("Invalid email or password");

  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET!, {
    subject: user.id,
    expiresIn: TOKEN_TTL,
  });

  return {
    token,
    maxAge: TOKEN_TTL_MS,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new UnauthorizedError("Session user no longer exists");
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function signup(email: string, password: string, name: string, role: Role) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
    },
  });

  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET!, {
    subject: user.id,
    expiresIn: TOKEN_TTL,
  });

  return {
    token,
    maxAge: TOKEN_TTL_MS,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

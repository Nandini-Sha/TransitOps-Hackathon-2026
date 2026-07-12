import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import * as authService from "./service";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const { token, maxAge, user } = await authService.login(email, password);
    res.cookie("token", token, { ...cookieOptions, maxAge });
    res.json(user);
  })
);

router.post("/logout", requireAuth, (_req, res) => {
  res.clearCookie("token", cookieOptions);
  res.status(204).send();
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user!.id);
    res.json(user);
  })
);

export default router;

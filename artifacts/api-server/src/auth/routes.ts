import { type IRouter, Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authStorage } from "./storage";
import { isAuthenticated } from "./customAuth";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

function publicUser(u: {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    profileImageUrl: u.profileImageUrl,
  };
}

export function authRouter(): IRouter {
  const router = Router();

  // POST /api/auth/register — create a new account and start a session
  router.post("/auth/register", async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.issues[0]?.message ?? "Invalid input",
          issues: parsed.error.issues,
        });
      }

      const { email, password, firstName, lastName } = parsed.data;
      const existing = await authStorage.getUserByEmail(email);
      if (existing) {
        return res
          .status(409)
          .json({ message: "An account with that email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await authStorage.createUser({
        email,
        passwordHash,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
      });

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) return next(err);
        res.status(201).json(publicUser(user));
      });
      return;
    } catch (err) {
      next(err);
      return;
    }
  });

  // POST /api/auth/login — verify password and start a session
  router.post("/auth/login", async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.issues[0]?.message ?? "Invalid input",
          issues: parsed.error.issues,
        });
      }

      const { email, password } = parsed.data;
      const user = await authStorage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res
          .status(401)
          .json({ message: "Invalid email or password" });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res
          .status(401)
          .json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) return next(err);
        res.json(publicUser(user));
      });
      return;
    } catch (err) {
      next(err);
      return;
    }
  });

  // POST /api/auth/logout — destroy the session
  router.post("/auth/logout", (req, res, next) => {
    if (!req.session) {
      res.json({ ok: true });
      return;
    }
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      res.json({ ok: true });
    });
  });

  // POST /api/auth/change-password — current user updates their own password
  router.post("/auth/change-password", isAuthenticated, async (req, res, next) => {
    try {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.issues[0]?.message ?? "Invalid input",
          issues: parsed.error.issues,
        });
      }

      const { currentPassword, newPassword } = parsed.data;
      const userId = req.session.userId!;
      const user = await authStorage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await authStorage.updatePassword(user.id, newHash);
      res.json({ ok: true });
      return;
    } catch (err) {
      next(err);
      return;
    }
  });

  // GET /api/auth/user — current signed-in user (or 401)
  router.get("/auth/user", isAuthenticated, async (req, res, next) => {
    try {
      const userId = req.session.userId!;
      const user = await authStorage.getUser(userId);
      if (!user) {
        // Stale session — clear it.
        req.session.destroy(() => {
          res.status(401).json({ message: "Unauthorized" });
        });
        return;
      }
      res.json(publicUser(user));
      return;
    } catch (err) {
      next(err);
      return;
    }
  });

  return router;
}

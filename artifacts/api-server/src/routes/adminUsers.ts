import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isAuthenticated, authStorage } from "../auth";

const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
});

const router: IRouter = Router();

router.use(isAuthenticated);

/**
 * Admin-only: create a login account for another person (e.g. when an admin
 * adds a staff member from the Staff page). Does NOT modify the current
 * admin's session — they stay logged in as themselves.
 */
router.post("/admin/users", async (req, res, next) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid input",
        issues: parsed.error.issues,
      });
      return;
    }

    const { email, password, firstName, lastName } = parsed.data;
    const existing = await authStorage.getUserByEmail(email);
    if (existing) {
      res
        .status(409)
        .json({ message: "An account with that email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await authStorage.createUser({
      email,
      passwordHash,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

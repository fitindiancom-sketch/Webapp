import { type IRouter, Router } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

export function authUserRouter(): IRouter {
  const router = Router();

  router.get("/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  return router;
}

import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { addWaitlistSignup, getWaitlistCount } from "../db";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";

export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  app.post("/api/waitlist", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) {
      res.status(400).json({ error: "Enter a valid email address." });
      return;
    }

    try {
      const result = await addWaitlistSignup(email);
      res.json({ ...result, count: await getWaitlistCount() });
    } catch (error) {
      console.error("[Waitlist] Failed to save signup:", error);
      res.status(500).json({ error: "Unable to join the waitlist right now." });
    }
  });

  return app;
}

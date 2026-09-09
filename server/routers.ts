import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { addWaitlistSignup, getWaitlistCount } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  waitlist: router({
    count: publicProcedure.query(async () => ({ count: await getWaitlistCount() })),
    join: publicProcedure
      .input(z.object({ email: z.string().trim().email("Enter a valid email address.").max(320) }))
      .mutation(async ({ input }) => {
        const result = await addWaitlistSignup(input.email);
        const count = await getWaitlistCount();
        return { ...result, count };
      }),
  }),
});

export type AppRouter = typeof appRouter;

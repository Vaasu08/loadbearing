import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  addWaitlistSignup: vi.fn(),
  getWaitlistCount: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { appRouter } from "./routers";

const caller = appRouter.createCaller({
  user: null,
  req: {} as never,
  res: {} as never,
});

describe("waitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWaitlistCount.mockResolvedValue(42);
  });

  it("validates, trims, and returns the current signup count", async () => {
    mocks.addWaitlistSignup.mockResolvedValue({ duplicate: false });

    const result = await caller.waitlist.join({ email: "  founder@scaleguard.dev  " });

    expect(mocks.addWaitlistSignup).toHaveBeenCalledWith("founder@scaleguard.dev");
    expect(result).toEqual({ duplicate: false, count: 42 });
  });

  it("preserves duplicate-email handling for the UI", async () => {
    mocks.addWaitlistSignup.mockResolvedValue({ duplicate: true });

    const result = await caller.waitlist.join({ email: "already@scaleguard.dev" });

    expect(result).toEqual({ duplicate: true, count: 42 });
  });

  it("rejects malformed email addresses before storage is called", async () => {
    await expect(caller.waitlist.join({ email: "not-an-email" })).rejects.toThrow("valid email");
    expect(mocks.addWaitlistSignup).not.toHaveBeenCalled();
  });
});

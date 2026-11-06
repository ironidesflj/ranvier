/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { CLEANUP_GRACE_MS, isExpired } from "./rate-limit";

const NOW = new Date("2026-01-01T12:00:00.000Z");

describe("isExpired", () => {
  test("expired beyond the grace period -> true", () => {
    const resetAt = new Date(NOW.getTime() - CLEANUP_GRACE_MS - 1);
    expect(isExpired(resetAt, NOW, CLEANUP_GRACE_MS)).toBe(true);
  });

  test("still inside the grace period -> false", () => {
    const resetAt = new Date(NOW.getTime() - CLEANUP_GRACE_MS + 1);
    expect(isExpired(resetAt, NOW, CLEANUP_GRACE_MS)).toBe(false);
  });

  test("bucket expiring in the future -> false", () => {
    const resetAt = new Date(NOW.getTime() + 5_000);
    expect(isExpired(resetAt, NOW, CLEANUP_GRACE_MS)).toBe(false);
  });
});

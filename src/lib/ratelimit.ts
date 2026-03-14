import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const createSecretLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:create",
});

export const getSecretLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:get",
});

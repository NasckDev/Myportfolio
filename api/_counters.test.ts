import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import visitsHandler, { type VisitsApiResponse } from "./visits.js";
import votesHandler, { type VotesApiResponse } from "./votes.js";
import { visitorId } from "./_redis.js";

class MockResponse<T> {
  statusCode = 200;
  body: T | undefined;
  headers = new Map<string, string>();

  setHeader(name: string, value: string) {
    this.headers.set(name.toLowerCase(), value);
  }

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(body: T) {
    this.body = body;
  }
}

const originalFetch = globalThis.fetch;
const envNames = ["KV_REST_API_URL", "KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"] as const;
const originalEnv = Object.fromEntries(envNames.map((n) => [n, process.env[n]]));
const headers = { "x-forwarded-for": "203.0.113.7, 10.0.0.1", "user-agent": "test-agent" };

let calls: { url: string; auth: string | null; command: unknown[] }[] = [];

/** Simula a API REST da Upstash devolvendo `results` na ordem das chamadas. */
function mockRedis(...results: unknown[]) {
  calls = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const h = new Headers(init?.headers);
    calls.push({ url: String(input), auth: h.get("authorization"), command: JSON.parse(String(init?.body)) });
    const result = results.shift();
    if (result instanceof Error) throw result;
    return new Response(JSON.stringify({ result }), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
}

beforeEach(() => {
  for (const n of envNames) delete process.env[n];
  process.env.KV_REST_API_URL = "https://redis.example.com/";
  process.env.KV_REST_API_TOKEN = "secret-token";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const n of envNames) {
    if (originalEnv[n] === undefined) delete process.env[n];
    else process.env[n] = originalEnv[n];
  }
});

test("visits: rejects unsupported methods", async () => {
  const res = new MockResponse<VisitsApiResponse>();
  await visitsHandler({ method: "DELETE", headers }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.get("allow"), "GET, POST");
  assert.deepEqual(res.body, { available: false });
});

test("visits: reports unavailable when Redis is not configured", async () => {
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  mockRedis();
  const res = new MockResponse<VisitsApiResponse>();
  await visitsHandler({ method: "POST", headers }, res);
  assert.deepEqual(res.body, { available: false });
  assert.equal(calls.length, 0);
});

test("visits: POST counts the visit with a hashed visitor key", async () => {
  mockRedis(42);
  const res = new MockResponse<VisitsApiResponse>();
  await visitsHandler({ method: "POST", headers }, res);
  assert.deepEqual(res.body, { available: true, visits: 42 });
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal(calls[0].url, "https://redis.example.com");
  assert.equal(calls[0].auth, "Bearer secret-token");
  const [cmd, , numKeys, seenKey, visitsKey] = calls[0].command;
  assert.equal(cmd, "EVAL");
  assert.equal(numKeys, 2);
  assert.equal(seenKey, `adn:seen:${visitorId({ headers })}`);
  assert.equal(visitsKey, "adn:visits");
  assert.ok(!JSON.stringify(calls[0].command).includes("203.0.113.7"), "IP must not be stored in plain text");
});

test("visits: GET reads the total without counting", async () => {
  mockRedis("17");
  const res = new MockResponse<VisitsApiResponse>();
  await visitsHandler({ method: "GET", headers }, res);
  assert.deepEqual(res.body, { available: true, visits: 17 });
  assert.deepEqual(calls[0].command, ["GET", "adn:visits"]);
});

test("visits: falls back when Redis fails", async () => {
  mockRedis(new Error("network down"));
  const res = new MockResponse<VisitsApiResponse>();
  await visitsHandler({ method: "POST", headers }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { available: false });
});

test("votes: GET returns totals and the visitor's current vote", async () => {
  mockRedis([12, 3, "up"]);
  const res = new MockResponse<VotesApiResponse>();
  await votesHandler({ method: "GET", headers }, res);
  assert.deepEqual(res.body, { available: true, likes: 12, dislikes: 3, vote: "up" });
});

test("votes: POST changes the vote atomically", async () => {
  mockRedis([13, 2, "up"]);
  const res = new MockResponse<VotesApiResponse>();
  await votesHandler({ method: "POST", headers, body: { vote: "up" } }, res);
  assert.deepEqual(res.body, { available: true, likes: 13, dislikes: 2, vote: "up" });
  const cmd = calls[0].command;
  assert.equal(cmd[0], "EVAL");
  assert.equal(cmd[2], 4);
  assert.deepEqual(cmd.slice(4, 7), ["adn:likes", "adn:dislikes", `adn:rl:${visitorId({ headers })}`]);
  assert.equal(cmd[7], "up");
});

test("votes: POST with null removes the vote", async () => {
  mockRedis([12, 2, ""]);
  const res = new MockResponse<VotesApiResponse>();
  await votesHandler({ method: "POST", headers, body: JSON.stringify({ vote: null }) }, res);
  assert.deepEqual(res.body, { available: true, likes: 12, dislikes: 2, vote: null });
  assert.equal(calls[0].command[7], "");
});

test("votes: rejects invalid payloads", async () => {
  mockRedis();
  const res = new MockResponse<VotesApiResponse>();
  await votesHandler({ method: "POST", headers, body: { vote: "love" } }, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { available: false, reason: "invalid" });
  assert.equal(calls.length, 0);
});

test("votes: rate limits abusive clients", async () => {
  mockRedis([-1, -1, ""]);
  const res = new MockResponse<VotesApiResponse>();
  await votesHandler({ method: "POST", headers, body: { vote: "down" } }, res);
  assert.equal(res.statusCode, 429);
  assert.deepEqual(res.body, { available: false, reason: "rate_limited" });
});

test("votes: accepts Upstash-native environment variable names", async () => {
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example.com";
  process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token";
  mockRedis([0, 0, ""]);
  const res = new MockResponse<VotesApiResponse>();
  await votesHandler({ method: "GET", headers }, res);
  assert.deepEqual(res.body, { available: true, likes: 0, dislikes: 0, vote: null });
  assert.equal(calls[0].auth, "Bearer upstash-token");
});

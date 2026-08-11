import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import handler, { type VisitorApiResponse } from "./visitors";

class MockResponse {
  statusCode = 200;
  body: VisitorApiResponse | undefined;
  headers = new Map<string, string>();

  setHeader(name: string, value: string) {
    this.headers.set(name.toLowerCase(), value);
  }

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(body: VisitorApiResponse) {
    this.body = body;
  }
}

const originalFetch = globalThis.fetch;
const originalEnvironment = {
  VERCEL_ENV: process.env.VERCEL_ENV,
  ANALYTICS_API_TOKEN: process.env.ANALYTICS_API_TOKEN,
  ANALYTICS_PROJECT_ID: process.env.ANALYTICS_PROJECT_ID,
  ANALYTICS_TEAM_ID: process.env.ANALYTICS_TEAM_ID,
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [name, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

test("rejects unsupported methods", async () => {
  const response = new MockResponse();
  await handler({ method: "POST" }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.get("allow"), "GET");
  assert.deepEqual(response.body, { available: false });
});

test("stays disabled outside production", async () => {
  process.env.VERCEL_ENV = "preview";
  const response = new MockResponse();
  await handler({ method: "GET" }, response);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { available: false });
});

test("falls back when production credentials are missing", async () => {
  process.env.VERCEL_ENV = "production";
  delete process.env.ANALYTICS_API_TOKEN;
  delete process.env.ANALYTICS_PROJECT_ID;
  const response = new MockResponse();
  await handler({ method: "GET" }, response);
  assert.deepEqual(response.body, { available: false });
});

test("returns validated visitor totals from Vercel Web Analytics", async () => {
  process.env.VERCEL_ENV = "production";
  process.env.ANALYTICS_API_TOKEN = "test-token";
  process.env.ANALYTICS_PROJECT_ID = "prj_test";
  process.env.ANALYTICS_TEAM_ID = "team_test";
  let requestedUrl = "";
  let authorization = "";

  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    authorization = new Headers(init?.headers).get("authorization") ?? "";
    return new Response(JSON.stringify({ data: { visitors: 1284, pageviews: 3190 } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const response = new MockResponse();
  await handler({ method: "GET" }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body?.available, true);
  assert.match(requestedUrl, /projectId=prj_test/);
  assert.match(requestedUrl, /teamId=team_test/);
  assert.equal(authorization, "Bearer test-token");
  assert.match(response.headers.get("cache-control") ?? "", /s-maxage=300/);
  if (response.body?.available) {
    assert.equal(response.body.visitors, 1284);
    assert.equal(response.body.pageviews, 3190);
    assert.ok(!Number.isNaN(Date.parse(response.body.updatedAt)));
  }
});

test("keeps the footer safe when the upstream payload is invalid", async () => {
  process.env.VERCEL_ENV = "production";
  process.env.ANALYTICS_API_TOKEN = "test-token";
  process.env.ANALYTICS_PROJECT_ID = "prj_test";
  globalThis.fetch = async () => new Response(JSON.stringify({ data: { visitors: "many" } }), { status: 200 });

  const response = new MockResponse();
  await handler({ method: "GET" }, response);
  assert.deepEqual(response.body, { available: false });
});

test("keeps the footer safe when Vercel Analytics is unavailable", async () => {
  process.env.VERCEL_ENV = "production";
  process.env.ANALYTICS_API_TOKEN = "test-token";
  process.env.ANALYTICS_PROJECT_ID = "prj_test";
  globalThis.fetch = async () => new Response("Unavailable", { status: 503 });

  const response = new MockResponse();
  await handler({ method: "GET" }, response);
  assert.deepEqual(response.body, { available: false });
});

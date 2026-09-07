import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { apiKeyAuth } from "./apiKeyAuth";
import { ingestMessages } from "../constants/messages";

function makeRes(): any {
  const res: any = { statusCode: 0, body: null };
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body: any) => {
    res.body = body;
    return res;
  };
  return res;
}

function makeReq(headers: Record<string, string> = {}) {
  return { headers } as any;
}

describe("apiKeyAuth", () => {
  const ORIGINAL_KEY = process.env.GATEWAY_API_KEY;

  beforeEach(() => {
    process.env.GATEWAY_API_KEY = "test-secret-key";
  });

  afterEach(() => {
    if (ORIGINAL_KEY === undefined) {
      delete process.env.GATEWAY_API_KEY;
    } else {
      process.env.GATEWAY_API_KEY = ORIGINAL_KEY;
    }
  });

  test("tanpa API key -> 401 apiKeyMissing dan next tidak dipanggil", () => {
    const res = makeRes();
    let nextCalled = false;

    apiKeyAuth(makeReq(), res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: ingestMessages.apiKeyMissing });
    assert.equal(nextCalled, false);
  });

  test("API key salah -> 401 apiKeyInvalid", () => {
    const res = makeRes();
    let nextCalled = false;

    apiKeyAuth(makeReq({ "x-api-key": "wrong-key" }), res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: ingestMessages.apiKeyInvalid });
    assert.equal(nextCalled, false);
  });

  test("API key benar -> next dipanggil tanpa response", () => {
    const res = makeRes();
    let nextCalled = false;

    apiKeyAuth(makeReq({ "x-api-key": "test-secret-key" }), res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 0);
    assert.equal(res.body, null);
    assert.equal(nextCalled, true);
  });

  test("GATEWAY_API_KEY tidak di-set -> semua permintaan ditolak 401", () => {
    delete process.env.GATEWAY_API_KEY;
    const res = makeRes();
    let nextCalled = false;

    apiKeyAuth(makeReq({ "x-api-key": "test-secret-key" }), res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: ingestMessages.apiKeyInvalid });
    assert.equal(nextCalled, false);
  });
});
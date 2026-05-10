/**
 * Unit tests for `/credentials/status/:statusListId.jwt` (§5.4.5).
 *
 * The router resolves a `StatusListUseCase` from the DI container, so the
 * tests register a fake usecase that returns either a fixed JWT or null.
 * Express's `supertest` runs the actual HTTP pipeline against an
 * in-memory app — no listening port needed.
 */

import "reflect-metadata";
import express from "express";
import request from "supertest";
import { container } from "tsyringe";
import credentialsRouter from "@/presentation/router/credentials";
import StatusListUseCase from "@/application/domain/credential/statusList/usecase";

const FAKE_JWT = "header-segment.payload-segment.stub-status-list-not-signed";

class FakeStatusListUseCase {
  getEncodedListJwt = jest.fn();
}

function makeApp() {
  const app = express();
  app.use("/credentials", credentialsRouter);
  return app;
}

describe("GET /credentials/status/:statusListId.jwt", () => {
  let fakeUsecase: FakeStatusListUseCase;

  beforeEach(() => {
    container.reset();
    fakeUsecase = new FakeStatusListUseCase();
    container.register(StatusListUseCase, {
      useValue: fakeUsecase as unknown as StatusListUseCase,
    });
    // The router uses container.resolve(StatusListUseCase) — also register
    // by string token in case anyone migrates it later, but the class
    // registration is what matters today.
    container.register("StatusListUseCase", { useValue: fakeUsecase });
    // The router also resolves "PrismaClientIssuer" from the container
    // (Minor 4 cleanup) instead of `new`-ing it per request. The issuer
    // is never actually invoked here because the fake usecase short-circuits
    // before any database call, so a bare `{}` value is sufficient.
    container.register("PrismaClientIssuer", { useValue: {} });
  });

  it("returns 200 with application/jwt content-type when the list exists", async () => {
    fakeUsecase.getEncodedListJwt.mockResolvedValue(FAKE_JWT);
    const res = await request(makeApp()).get("/credentials/status/1.jwt");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/jwt/);
    expect(res.text).toBe(FAKE_JWT);
    expect(fakeUsecase.getEncodedListJwt).toHaveBeenCalledWith(expect.anything(), "1");
  });

  it("returns 404 with no body when the list does not exist", async () => {
    fakeUsecase.getEncodedListJwt.mockResolvedValue(null);
    const res = await request(makeApp()).get("/credentials/status/999.jwt");
    expect(res.status).toBe(404);
    expect(res.text).toBe("");
  });

  it("returns 500 with the standard error envelope when the usecase throws", async () => {
    fakeUsecase.getEncodedListJwt.mockRejectedValue(new Error("boom"));
    const res = await request(makeApp()).get("/credentials/status/1.jwt");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });

  it("sets the public Cache-Control header on the success path", async () => {
    fakeUsecase.getEncodedListJwt.mockResolvedValue(FAKE_JWT);
    const res = await request(makeApp()).get("/credentials/status/1.jwt");
    expect(res.headers["cache-control"]).toMatch(/public/);
    expect(res.headers["cache-control"]).toMatch(/max-age=300/);
  });

  it("sets the open CORS header so verifiers from any origin can resolve the list", async () => {
    fakeUsecase.getEncodedListJwt.mockResolvedValue(FAKE_JWT);
    const res = await request(makeApp()).get("/credentials/status/1.jwt");
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });
});

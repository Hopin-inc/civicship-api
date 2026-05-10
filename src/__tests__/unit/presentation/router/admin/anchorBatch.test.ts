/**
 * Unit tests for `POST /admin/anchor-batch/run`.
 *
 * - X-CloudScheduler-Token 不一致 → 401
 * - token 一致 + UseCase 成功 → 200 with body
 * - body.weeklyKey 不正 → 400
 */

import "reflect-metadata";
import express from "express";
import request from "supertest";
import { container } from "tsyringe";

import anchorBatchRouter from "@/presentation/router/admin/anchorBatch";
import AnchorBatchUseCase from "@/application/domain/anchor/anchorBatch/usecase";

describe("POST /admin/anchor-batch/run", () => {
  let app: express.Express;
  let mockUseCase: { runBatch: jest.Mock };
  const ENV_BACKUP: Record<string, string | undefined> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    ENV_BACKUP.CLOUD_SCHEDULER_TOKEN = process.env.CLOUD_SCHEDULER_TOKEN;
    process.env.CLOUD_SCHEDULER_TOKEN = "secret-token";

    mockUseCase = {
      runBatch: jest.fn().mockResolvedValue({
        batchId: "2026-W19",
        submitted: true,
        txHash: "dead".repeat(16),
        status: "CONFIRMED",
        anchorCounts: { userDid: 1, vc: 2, tx: 3 },
      }),
    };
    container.register("PrismaClientIssuer", { useValue: { internal: jest.fn() } });
    container.registerInstance(AnchorBatchUseCase, mockUseCase as unknown as AnchorBatchUseCase);

    app = express();
    app.use("/admin/anchor-batch", anchorBatchRouter);
  });

  afterEach(() => {
    if (ENV_BACKUP.CLOUD_SCHEDULER_TOKEN === undefined) {
      delete process.env.CLOUD_SCHEDULER_TOKEN;
    } else {
      process.env.CLOUD_SCHEDULER_TOKEN = ENV_BACKUP.CLOUD_SCHEDULER_TOKEN;
    }
  });

  it("returns 401 without the token header", async () => {
    const res = await request(app).post("/admin/anchor-batch/run").send({});
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(mockUseCase.runBatch).not.toHaveBeenCalled();
  });

  it("returns 401 with a wrong token", async () => {
    const res = await request(app)
      .post("/admin/anchor-batch/run")
      .set("X-CloudScheduler-Token", "wrong")
      .send({});
    expect(res.status).toBe(401);
    expect(mockUseCase.runBatch).not.toHaveBeenCalled();
  });

  it("returns 200 and the result when the token matches", async () => {
    const res = await request(app)
      .post("/admin/anchor-batch/run")
      .set("X-CloudScheduler-Token", "secret-token")
      .send({ weeklyKey: "2026-W19" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      batchId: "2026-W19",
      submitted: true,
      txHash: "dead".repeat(16),
      status: "CONFIRMED",
      anchorCounts: { userDid: 1, vc: 2, tx: 3 },
    });
    expect(mockUseCase.runBatch).toHaveBeenCalledWith(expect.anything(), { weeklyKey: "2026-W19" });
  });

  it("returns 400 when weeklyKey is malformed", async () => {
    const res = await request(app)
      .post("/admin/anchor-batch/run")
      .set("X-CloudScheduler-Token", "secret-token")
      .send({ weeklyKey: "not-a-week" });
    expect(res.status).toBe(400);
    expect(mockUseCase.runBatch).not.toHaveBeenCalled();
  });

  it("returns 400 when weeklyKey is non-string", async () => {
    const res = await request(app)
      .post("/admin/anchor-batch/run")
      .set("X-CloudScheduler-Token", "secret-token")
      .send({ weeklyKey: 12345 });
    expect(res.status).toBe(400);
    expect(mockUseCase.runBatch).not.toHaveBeenCalled();
  });

  it("returns 200 when no body is provided (server computes weeklyKey)", async () => {
    const res = await request(app)
      .post("/admin/anchor-batch/run")
      .set("X-CloudScheduler-Token", "secret-token")
      .send();

    expect(res.status).toBe(200);
    expect(mockUseCase.runBatch).toHaveBeenCalled();
  });

  it("returns 500 when CLOUD_SCHEDULER_TOKEN is not configured", async () => {
    delete process.env.CLOUD_SCHEDULER_TOKEN;
    const res = await request(app)
      .post("/admin/anchor-batch/run")
      .set("X-CloudScheduler-Token", "anything")
      .send({});
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });

  it("returns 500 when the usecase throws", async () => {
    mockUseCase.runBatch.mockRejectedValue(new Error("boom"));
    const res = await request(app)
      .post("/admin/anchor-batch/run")
      .set("X-CloudScheduler-Token", "secret-token")
      .send({});
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });
});

import "reflect-metadata";
import { container } from "tsyringe";
import ReportEntityRepository from "@/application/domain/report/data/repository/reportEntity";
import ReportTemplateRepository from "@/application/domain/report/data/repository/template";

/**
 * Smoke test for the Phase B repository split. Each new disjoint
 * repository must be registrable + resolvable through tsyringe so
 * caller-side switches in subsequent commits can rely on the same
 * tokens the production provider wires up. We register against
 * isolated tokens here (not the production provider) to avoid
 * pulling in storage / GCS / Firebase side-effects.
 *
 * ReportTransactionStatsRepository is exercised through the existing
 * report-domain integration tests rather than this unit smoke — it
 * imports the typed-SQL helpers from `@prisma/client/sql` whose code
 * generation needs `prisma generate --sql` (DB-connected) to run,
 * which the unit test pipeline does not provide.
 */
describe("report repository DI registrations", () => {
  beforeEach(() => {
    container.clearInstances();
  });

  it("resolves ReportEntityRepository", () => {
    container.register("ReportEntityRepository", { useClass: ReportEntityRepository });
    expect(container.resolve("ReportEntityRepository")).toBeInstanceOf(ReportEntityRepository);
  });

  it("resolves ReportTemplateRepository", () => {
    container.register("ReportTemplateRepository", { useClass: ReportTemplateRepository });
    expect(container.resolve("ReportTemplateRepository")).toBeInstanceOf(ReportTemplateRepository);
  });
});

import UtilityService from "@/app/utility/service";
import UtilityRepository from "@/infra/repositories/utility";
import { IContext } from "@/types/server";
import { GqlMutationUtilityUpdateInfoArgs, GqlUtility, GqlUtilityCreateInput } from "@/types/graphql";

jest.mock("@/infra/repositories/utility");

describe("UtilityService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { user: { id: "test-user" } } as unknown as IContext;
        jest.clearAllMocks();
    });

    describe("fetchUtilities", () => {
        it("should fetch utilities correctly", async () => {
            const mockUtilities = [{ id: "1", name: "Utility 1" }] as GqlUtility[];
            (UtilityRepository.query as jest.Mock).mockResolvedValue(mockUtilities);

            const result = await UtilityService.fetchUtilities(ctx, { cursor: "1", filter: {}, sort: {} }, 10);

            expect(UtilityRepository.query).toHaveBeenCalledWith(
                ctx,
                expect.any(Object),  // where condition (UtilityInputFormat.filter(filter ?? {}))
                expect.any(Object),  // orderBy condition (UtilityInputFormat.sort(sort ?? {}))
                10,
                "1"
            );
            expect(result).toEqual(mockUtilities);
        });
    });

    describe("findUtility", () => {
        it("should find a utility by id", async () => {
            const mockUtility = { id: "1", name: "Utility 1" } as GqlUtility;
            (UtilityRepository.find as jest.Mock).mockResolvedValue(mockUtility);

            const result = await UtilityService.findUtility(ctx, "1");

            expect(UtilityRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockUtility);
        });
    });

    describe("findUtilityOrThrow", () => {
        it("should throw an error if utility is not found", async () => {
            (UtilityRepository.find as jest.Mock).mockResolvedValue(null);

            await expect(UtilityService.findUtilityOrThrow(ctx, "1")).rejects.toThrowError(
                "UtilityNotFound: ID=1"
            );
        });

        it("should return the utility if found", async () => {
            const mockUtility = { id: "1", name: "Utility 1" } as GqlUtility;
            (UtilityRepository.find as jest.Mock).mockResolvedValue(mockUtility);

            const result = await UtilityService.findUtilityOrThrow(ctx, "1");

            expect(UtilityRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockUtility);
        });
    });

    describe("createUtility", () => {
        it("should create a new utility", async () => {
            const input: GqlUtilityCreateInput = {
                name: "New Utility",
                communityId: "",
                pointsRequired: 0
            };
            const mockUtility = { id: "1", name: "New Utility" } as GqlUtility;
            (UtilityRepository.create as jest.Mock).mockResolvedValue(mockUtility);

            const result = await UtilityService.createUtility(ctx, input);

            expect(UtilityRepository.create).toHaveBeenCalledWith(
                ctx,
                expect.objectContaining({ name: "New Utility" })
            );
            expect(result).toEqual(mockUtility);
        });
    });

    describe("deleteUtility", () => {
        it("should delete a utility by id", async () => {
            const mockUtility = { id: "1", name: "Utility 1" } as GqlUtility;
            (UtilityRepository.delete as jest.Mock).mockResolvedValue(mockUtility);

            const result = await UtilityService.deleteUtility(ctx, "1");

            expect(UtilityRepository.delete).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockUtility);
        });
    });

    describe("updateUtilityInfo", () => {
        it("should update the utility info", async () => {
            const input: GqlMutationUtilityUpdateInfoArgs = {
                id: "1", input: {
                    name: "Updated Utility",
                    communityId: "",
                    pointsRequired: 0
                }
            };
            const mockUtility = { id: "1", name: "Updated Utility" } as GqlUtility;
            (UtilityRepository.update as jest.Mock).mockResolvedValue(mockUtility);

            const result = await UtilityService.updateUtilityInfo(ctx, input);

            expect(UtilityRepository.update).toHaveBeenCalledWith(
                ctx,
                "1",
                expect.objectContaining({ name: "Updated Utility" })
            );
            expect(result).toEqual(mockUtility);
        });
    });
});

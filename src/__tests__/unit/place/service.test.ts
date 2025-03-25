import PlaceService from "@/app/place/service";
import PlaceRepository from "@/infra/repositories/place";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";

jest.mock("@/infra/repositories/place");

describe("PlaceService", () => {
    let ctx: IContext;
    let tx: Prisma.TransactionClient;

    beforeEach(() => {
        ctx = { user: { id: "test-user" } } as unknown as IContext;
        tx = {} as Prisma.TransactionClient;
        jest.clearAllMocks();
    });

    describe("fetchPlaces", () => {
        it("should fetch a list of places", async () => {
            const mockPlaces = [{ id: "1", name: "Place 1" }, { id: "2", name: "Place 2" }];
            (PlaceRepository.query as jest.Mock).mockResolvedValue(mockPlaces);

            const result = await PlaceService.fetchPlaces(ctx, { cursor: undefined, filter: {}, sort: {} }, 10);

            expect(PlaceRepository.query).toHaveBeenCalledWith(
                ctx,
                expect.objectContaining({}),
                expect.any(Array),
                10,
                undefined
            );
            expect(result).toEqual(mockPlaces);
        });

        it("should handle pagination cursor correctly", async () => {
            const mockPlaces = [{ id: "1", name: "Place 1" }];
            (PlaceRepository.query as jest.Mock).mockResolvedValue(mockPlaces);

            const result = await PlaceService.fetchPlaces(ctx, { cursor: "1", filter: {}, sort: {} }, 10);

            expect(PlaceRepository.query).toHaveBeenCalledWith(
                ctx,
                expect.objectContaining({}),
                expect.any(Array),
                10,
                "1"
            );
            expect(result).toEqual(mockPlaces);
        });
    });

    describe("findPlace", () => {
        it("should find a place by id", async () => {
            const mockPlace = { id: "1", name: "Place 1" };
            (PlaceRepository.find as jest.Mock).mockResolvedValue(mockPlace);

            const result = await PlaceService.findPlace(ctx, "1");

            expect(PlaceRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockPlace);
        });
    });

    describe("createPlace", () => {
        it("should create a place", async () => {
            const mockPlace = { id: "1", name: "Place 1", cityCode: "city1", address: "address 1", latitude: "0", longitude: "0", isManual: false };
            const input = { name: "Place 1", cityCode: "city1", address: "address 1", latitude: "0", longitude: "0", isManual: false };
            const txMock = {} as Prisma.TransactionClient;
            (PlaceRepository.create as jest.Mock).mockResolvedValue(mockPlace);

            const result = await PlaceService.createPlace(ctx, input, txMock);

            expect(PlaceRepository.create).toHaveBeenCalledWith(ctx, expect.objectContaining({ name: "Place 1", address: "address 1", latitude: "0", longitude: "0" }), txMock);
            expect(result).toEqual(mockPlace);
        });
    });

    describe("deletePlace", () => {
        it("should delete a place", async () => {
            const mockPlace = { id: "1", name: "Place 1" };
            (PlaceRepository.find as jest.Mock).mockResolvedValue(mockPlace);
            (PlaceRepository.delete as jest.Mock).mockResolvedValue(mockPlace);

            const result = await PlaceService.deletePlace(ctx, "1", tx);

            expect(PlaceRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(PlaceRepository.delete).toHaveBeenCalledWith(ctx, "1", tx);
            expect(result).toEqual(mockPlace);
        });

        it("should throw an error if place not found", async () => {
            (PlaceRepository.find as jest.Mock).mockResolvedValue(null);

            await expect(PlaceService.deletePlace(ctx, "non-existing-id", tx)).rejects.toThrow(
                "PlaceNotFound: ID=non-existing-id"
            );
        });
    });

    describe("updatePlace", () => {
        it("should update a place", async () => {
            const mockPlace = { id: "1", name: "Place 1" };
            const input = { name: "Updated Place" };
            const txMock = {} as Prisma.TransactionClient;
            (PlaceRepository.find as jest.Mock).mockResolvedValue(mockPlace);
            (PlaceRepository.update as jest.Mock).mockResolvedValue({ ...mockPlace, name: "Updated Place" });

            const result = await PlaceService.updatePlace(ctx, "1", input, txMock);

            expect(PlaceRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(PlaceRepository.update).toHaveBeenCalledWith(ctx, "1", expect.objectContaining({ name: "Updated Place" }), txMock);
            expect(result).toEqual({ ...mockPlace, name: "Updated Place" });
        });

        it("should throw an error if place not found", async () => {
            (PlaceRepository.find as jest.Mock).mockResolvedValue(null);

            await expect(PlaceService.updatePlace(ctx, "non-existing-id", {}, tx)).rejects.toThrow(
                "PlaceNotFound: ID=non-existing-id"
            );
        });
    });
});

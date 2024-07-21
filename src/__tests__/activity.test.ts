import ActivityService from "@/services/activity.service";
import { prismaClient } from "@/prisma/client";
import { GqlActivitiesConnection } from "@/types/graphql";

jest.mock("@/prisma/client", () => ({
  prismaClient: {
    activity: {
      findMany: jest.fn(),
    },
  },
}));

describe("ActivityService", () => {
  describe("queryActivities", () => {
    it("should return a list of activities", async () => {
      const mockActivities: GqlActivitiesConnection = {
        edges: [
          {
            cursor: "1",
            node: {
              id: "1",
              startsAt: new Date(),
              endsAt: new Date(),
              isPublic: false,
              user: {
                id: "b",
                firstName: "test",
                lastName: "taro",
                isPublic: false,
                createdAt: new Date(),
              },
              event: {
                id: "a",
                startsAt: new Date(),
                endsAt: new Date(),
                isPublic: false,
                createdAt: new Date(),
              },
              createdAt: new Date(),
            },
          },
        ],
        pageInfo: {
          startCursor: "1",
          endCursor: "1",
          hasNextPage: false,
          hasPreviousPage: true,
        },
        totalCount: 1,
      };
      (prismaClient.activity.findMany as jest.Mock).mockResolvedValue(
        mockActivities.edges?.map((edge) => edge?.node),
      );

      const result = await ActivityService.queryActivities({
        /* parameters */
      });

      expect(result).toEqual(mockActivities);
    });
  });

  // describe("queryActivity", () => {
  //   it("should return a single activity", async () => {
  //     const mockActivity = { id: 1, name: "Activity 1" };
  //     (prismaClient.activity.findUnique as jest.Mock).mockResolvedValue(
  //       mockActivity,
  //     );

  //     const result = await ActivityService.queryActivity({ id: 1 });

  //     expect(result).toEqual(mockActivity);
  //   });

  //   it("should return null if activity not found", async () => {
  //     (prismaClient.activity.findUnique as jest.Mock).mockResolvedValue(null);

  //     const result = await ActivityService.queryActivity({ id: 1 });

  //     expect(result).toBeNull();
  //   });
  // });

  // describe("createActivity", () => {
  //   it("should create a new activity", async () => {
  //     const newActivity = { name: "New Activity" };
  //     const createdActivity = { id: 1, ...newActivity };
  //     (prismaClient.activity.create as jest.Mock).mockResolvedValue(
  //       createdActivity,
  //     );

  //     const result = await ActivityService.createActivity({
  //       data: newActivity,
  //     });

  //     expect(result).toEqual(createdActivity);
  //   });
  // });

  // describe("updateActivity", () => {
  //   it("should update an existing activity", async () => {
  //     const updatedActivity = { id: 1, name: "Updated Activity" };
  //     (prismaClient.activity.update as jest.Mock).mockResolvedValue(
  //       updatedActivity,
  //     );

  //     const result = await ActivityService.updateActivity({
  //       id: 1,
  //       data: { name: "Updated Activity" },
  //     });

  //     expect(result).toEqual(updatedActivity);
  //   });
  // });

  // describe("deleteActivity", () => {
  //   it("should delete an existing activity", async () => {
  //     (prismaClient.activity.delete as jest.Mock).mockResolvedValue({});

  //     const result = await ActivityService.deleteActivity({ id: 1 });

  //     expect(result).toBeTruthy();
  //   });
  // });
});

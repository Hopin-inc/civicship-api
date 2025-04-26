import TestDataSourceHelper from "@/__tests__/helper/test-data-source-helper";
import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import request from "supertest";
import { createTestApp, issueTestToken } from "@/__tests__/helper/utils";
import express from "express";

let app: express.Application;

describe("communityDelete e2e", () => {
  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    app = await createTestApp();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("allows OWNER to delete their own community", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "owner-user",
      slug: "owner-user-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({
      name: "community-donate",
      pointName: "c-point",
    });
    await TestDataSourceHelper.createMembership({
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.CREATED_COMMUNITY,
      role: Role.OWNER,
    });

    const token = issueTestToken(user.id);

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `
          mutation DeleteCommunity($id: ID!, $permission: CheckCommunityPermissionInput!) {
            communityDelete(id: $id, permission: $permission) {
              id
            }
          }
        `,
        variables: {
          id: community.id,
          permission: { communityId: community.id },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.communityDelete.id).toBe(community.id);
  });

  it("denies MEMBER from deleting the community", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "member-user",
      slug: "member-user-slug",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "c-point",
    });
    await TestDataSourceHelper.createMembership({
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      reason: MembershipStatusReason.CREATED_COMMUNITY,
      role: Role.MEMBER,
    });

    const token = issueTestToken(user.id);

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `
          mutation DeleteCommunity($id: ID!, $permission: CheckCommunityPermissionInput!) {
            communityDelete(id: $id, permission: $permission) {
              id
            }
          }
        `,
        variables: {
          id: community.id,
          permission: { communityId: community.id },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.errors[0].message).toMatch(/owner/i);
    expect(res.body.data).toBeNull();
  });
});

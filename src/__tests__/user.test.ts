import { UserFactory } from "@/prisma/__generated__/factory";

describe("UserService", () => {
  const prisma = jestPrisma.client;

  test("should create a new user", async () => {
    const user = await UserFactory.create({ id: "001" });
    console.log(user);

    expect(
      await prisma.user.findUnique({
        where: {
          id: "001",
        },
      }),
    ).toStrictEqual(user);
  });
});

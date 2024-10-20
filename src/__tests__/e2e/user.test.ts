import UserUseCase from "@/domains/user/usecase";
import TestDataSourceHelper from "../helper/test-data-source-helper";
import * as GqlTypes from "../../types/graphql";


describe("UserService", () => {
  beforeEach(async () => {
    // テスト前にDBのデータをリセット
    await TestDataSourceHelper.deleteAll();
  });

  afterAll(async () => {
    // Prismaの接続を閉じる
    TestDataSourceHelper.disconnect();
  });

  it("should create a new user", async () => {
    const id = "001";
    const lastName = "Doe";
    const firstName = "John";

    const input = {
      input: {
        id: id,
        lastName: lastName,
        firstName: firstName,
      },
    };
    const returned = await UserUseCase.userCreateUser(input);

    // DBに挿入されたデータを取得
    const users = await TestDataSourceHelper.findAll();
    const user = users.filter(users => users.id = id);

    // データが期待通りに挿入されたか確認
    expect(user.length).toBe(1);
    expect(user[0].lastName).toBe(input.input.lastName);
    expect(user[0].firstName).toBe(input.input.firstName);

    // usecase層の返り値（≒レスポンス）の検証
    expect(returned.__typename).toBe("UserCreateSuccess");
    expect(returned.user).toBeDefined();
    // データ挿入時にデフォルト値が設定されることを検証
    expect(returned.user?.sysRole).toBe(GqlTypes.GqlSysRole.User);
    expect(returned.user?.isPublic).toBeFalsy();
    expect(returned.user?.createdAt).toBeDefined();
    expect(returned.user?.updatedAt).toBeDefined();
  });
});

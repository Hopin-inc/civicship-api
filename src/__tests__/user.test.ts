import UserUseCase from "@/domains/user/usecase";
import TestDbUtil from "./util/test-db-util";


describe("UserService", () => {
  test("should create a new user", async () => {
    const id = "001"
    const lastName = "Doe"
    const firstName = "John"

    const input = {input:{
      id: id,
      lastName: lastName,
      firstName: firstName
    }}
    await UserUseCase.userCreateUser(input)

    // DBに挿入されたデータを取得
    const users = await TestDbUtil.findAll()
    const user = users.filter(users => users.id = id)

    // データが期待通りに挿入されたか確認
    expect(user.length).toBe(1)
    expect(user[0].lastName).toBe(input.input.lastName);
    expect(user[0].firstName).toBe(input.input.firstName)
})})
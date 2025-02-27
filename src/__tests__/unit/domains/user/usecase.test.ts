// import UserUsecase from "@/domains/user/usecase";
// import UserService from "@/domains/user/service";
//
// // TODO: ctxを流し込めるようにする
//
// // モック化するためにjestのspyOnを使う
// jest.mock("@/domains/user/service");
//
// describe("UserUsecase.userGetUser", () => {
//   const userId = "001";
//   const mockUser = { id: "001", name: "John Doe" }; // モックデータ
//
//   // モックを設定する
//   beforeEach(() => {
//     jest.clearAllMocks(); // 各テスト間でモックをリセットする
//   });
//
//   test("should return user when user is found", async () => {
//     // モックの振る舞いを定義
//     (UserService.findUser as jest.Mock).mockResolvedValue(mockUser);
//
//     // テスト対象のメソッドを呼び出し
//     const result = await UserUsecase.userGetUser({ id: userId });
//
//     // モックが正しく呼び出されたか確認
//     expect(UserService.findUser).toHaveBeenCalledWith(userId);
//
//     // ユーザーが見つかったら、ユーザーのデータを返すことを確認
//     expect(result).toEqual(mockUser);
//   });
//
//   test("should return null when user is not found", async () => {
//     // ユーザーが見つからない場合のモックの振る舞い
//     (UserService.findUser as jest.Mock).mockResolvedValue(null);
//
//     // テスト対象のメソッドを呼び出し
//     const result = await UserUsecase.userGetUser({ id: userId });
//
//     // モックが正しく呼び出されたか確認
//     expect(UserService.findUser).toHaveBeenCalledWith(userId);
//
//     // ユーザーが見つからない場合、nullを返すことを確認
//     expect(result).toBeNull();
//   });
// });

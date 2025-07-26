import "reflect-metadata";
import { GqlOpportunityFilterInput } from "@/types/graphql";
import OpportunityConverter from "@/application/domain/experience/opportunity/data/converter";

describe("OpportunityConverter", () => {
  let converter: OpportunityConverter;
  
  beforeEach(() => {
    converter = new OpportunityConverter();
    
    // 環境変数のモック
    process.env.ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG = JSON.stringify({
      "opportunity-1": 0,
      "opportunity-2": 3,
      "opportunity-3": 7
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG;
  });
  
  describe("filter", () => {
    it("通常の一覧表示時（キーワードなし）は予約締め切りフィルターが適用される", () => {
      // キーワードなしのフィルター
      const filter: GqlOpportunityFilterInput = {};
      
      // filterメソッドを呼び出し
      const result = converter.filter(filter);
      
      // 結果にAND条件が含まれていることを確認
      expect(result).toHaveProperty("AND");
      
      // AND配列の中に予約締め切りフィルターがあることを確認
      const andConditions = (result as any).AND;
      
      // 予約締め切りフィルターを探す（OR条件を含むフィルター）
      const deadlineFilter = andConditions.find((condition: any) => 
        condition.OR && Array.isArray(condition.OR)
      );
      
      // 予約締め切りフィルターが存在することを確認
      expect(deadlineFilter).toBeDefined();
    });
    
    it("検索時（キーワードあり）はキーワード検索条件が含まれる", () => {
      // キーワードありのフィルター
      const filter: GqlOpportunityFilterInput = {
        keyword: "テスト"
      };
      
      // filterメソッドを呼び出し
      const result = converter.filter(filter);
      
      // 結果にキーワード検索条件が含まれていることを確認
      expect(result).toHaveProperty("AND");
      
      const andConditions = (result as any).AND;
      
      // キーワード検索条件を探す
      const keywordFilter = andConditions.find((condition: any) => 
        condition.OR && Array.isArray(condition.OR) && 
        condition.OR.some((orCondition: any) => 
          orCondition.title && typeof orCondition.title === "object" && "contains" in orCondition.title
        )
      );
      
      // キーワード検索条件が存在することを確認
      expect(keywordFilter).toBeDefined();
    });
    
    // スロットがないアクティビティが表示されることを確認するテスト
    it("スロットがないアクティビティも表示される", () => {
      // キーワードなしのフィルター
      const filter: GqlOpportunityFilterInput = {};
      
      // filterメソッドを呼び出し
      const result = converter.filter(filter);
      
      // 結果にAND条件が含まれていることを確認
      expect(result).toHaveProperty("AND");
      
      // AND配列の中に予約締め切りフィルターがあることを確認
      const andConditions = (result as any).AND;
      
      // 予約締め切りフィルターを探す（OR条件を含むフィルター）
      const deadlineFilter = andConditions.find((condition: any) => 
        condition.OR && Array.isArray(condition.OR)
      );
      
      // 予約締め切りフィルターが存在することを確認
      expect(deadlineFilter).toBeDefined();
      
      // OR条件の中にスロットがないアクティビティを表示する条件があることを確認
      const orConditions = deadlineFilter.OR;
      
      // スロットがないアクティビティを表示する条件を探す
      const noSlotsCondition = orConditions.find((condition: any) => 
        condition.slots && 
        typeof condition.slots === "object" && 
        "none" in condition.slots
      );
      
      // スロットがないアクティビティを表示する条件が存在することを確認
      expect(noSlotsCondition).toBeDefined();
    });
  });
});

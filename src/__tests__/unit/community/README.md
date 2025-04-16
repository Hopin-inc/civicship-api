# ✅ 単体テスト報告書｜CommunityService ユニットテスト

## 📌 対象モジュール

- **対象クラス**：`CommunityService`
- **依存モック**：
    - `CommunityRepository`（CRUD）
    - `CommunityConverter`（create / update 入力整形）
- **テスト対象メソッド**：
    - `createCommunityAndJoinAsOwner`
    - `updateCommunityProfile`
    - `deleteCommunity`

---

## 🧪 テスト実施内容と結果

### 1. `createCommunityAndJoinAsOwner`

| 項目 | 内容 |
|------|------|
| ケース数 | 1件（正常系） |
| 主な検証内容 | Converterの呼び出し／Repositoryへの正しい引数伝達／返却値の一致 |
| モック | `CommunityConverter.create`, `CommunityRepository.create` |
| テスト内容 | ユーザーが新規Communityを作成し、自動でOWNERとして所属する処理が正しく動作するか |
| 結果 | ✅ 成功（期待通りのCommunityが返る） |

---

### 2. `updateCommunityProfile`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（異常系: NotFound／正常系: 更新成功） |
| 主な検証内容 | NotFoundエラーのスロー、Repositoryの更新呼び出し、返却値の一致 |
| モック | `CommunityRepository.find`, `CommunityRepository.update`, `CommunityConverter.update` |
| テスト内容 | Community存在チェックと更新内容が正しく反映されるかどうか |
| 結果 | ✅ 成功（エラー／更新どちらも期待通り） |

---

### 3. `deleteCommunity`

| 項目 | 内容 |
|------|------|
| ケース数 | 2件（異常系: NotFound／正常系: 削除成功） |
| 主な検証内容 | 存在確認 → 削除呼び出しの流れの確認 |
| モック | `CommunityRepository.find`, `CommunityRepository.delete` |
| テスト内容 | 存在しない場合のエラー処理と、削除の副作用検証 |
| 結果 | ✅ 成功（NotFoundエラーとdelete呼び出し検証済） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **テストカバレッジ** | ⭐️⭐️⭐️⭐️⭐️（高） | 異常系・正常系どちらも網羅されており、全メソッドに対してユースケースが定義されている。 |
| **モック戦略** | ⭐️⭐️⭐️⭐️⭐️（適切） | Repository, Converter ともに jest.mock 経由でモック。`mockResolvedValue`, `mockReturnValue`の活用も良好。 |
| **検証の粒度** | ⭐️⭐️⭐️⭐️⭐️（詳細） | Converter呼び出し／Repository引数／返却オブジェクトまで確認されており、粒度も適切。 |
| **責務の分離** | ⭐️⭐️⭐️⭐️⭐️（良好） | ロジックはServiceに集約されており、テストでもConverterやRepositoryの責務範囲を守っている。 |
| **副作用の検証** | ⭐️⭐️⭐️⭐️⭐️（適切） | delete系などの副作用メソッドもきちんと呼び出しの確認がされている。 |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **A+（非常に高品質）**  
  ユニットテストとして理想的な構造であり、ビジネスロジックの検証に必要な網羅性・粒度がすべて確保されている。

### 🛠 改善ポイント（任意）

- `createCommunityAndJoinAsOwner` の異常系（Converterがthrowなど）のケースも加えると堅牢性UP。
- `updateCommunityProfile` で image や null許容フィールドの分岐も1件あるとカバレッジがさらに明確に。
- `mockCommunity` の構造が実プロダクション型と一致しているかの型検証が明示されているとより安全。

---


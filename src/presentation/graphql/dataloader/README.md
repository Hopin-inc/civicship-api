# GraphQL × DataLoader 実装方針（`Gql` プレフィックス対応）

## 1. DataLoader の種類と使い分け

| 用途                                 | DataLoaderの種類              | 使用する汎用関数                                 |
|--------------------------------------|-------------------------------|--------------------------------------------------|
| 単一ID → 単一リソース取得             | 単一取得Loader                | `createLoaderById` / `createNullableLoaderById`  |
| 複合キー → 単一リソース取得           | 複合キーLoader                | `createLoaderByCompositeKey`                     |
| 外部キー → 複数リソース取得（1:N）     | リスト取得Loader              | `createHasManyLoaderByKey`                       |
| 外部キー + filter/sort → 複数取得      | 絞り込み付きリストLoader      | `createFilterSortAwareHasManyLoaderByKey`        |
| 中間テーブル経由N:Nリレーション        | N:Nリスト取得Loader           | `createHasManyLoaderViaJoin`                     |

- `createHasManyLoaderByKey` は nullableな外部キーにも対応しています。
- N:Nリレーション（例: participationId → images）は `createHasManyLoaderViaJoin` を利用します。

---

## 2. GraphQL FieldResolver 実装指針

### 単数リレーション（例: `user`, `community`, `reservation`）

- 親が外部キーを持つ場合は `.load(parent.xxxId)`
- 外部キーが null 許容の場合は `?? null` を使う
- 使用関数：`createNullableLoaderById`

```ts
user: (parent, _, ctx) => {
  return parent.userId ? ctx.loaders.user.load(parent.userId) : null;
}
```

---

### 複数リレーション（1:N, N:N, filter/sort付き）

- 親の `id` をキーに `.load(parent.id)`
- 子リソースが `parent.id` を参照する外部キーを持っていることが前提
- N:Nリレーションは中間テーブル経由で `.load(parent.id)`
- filter/sort付きは専用Loaderを使う

```ts
// 1:N
statusHistories: (parent, _, ctx) => {
  return ctx.loaders.statusHistoriesByParticipation.load(parent.id);
}

// N:N
images: (parent, _, ctx) => {
  return ctx.loaders.imagesByParticipation.load(parent.id);
}

// filter/sort付き
transactions: (parent, args, ctx) => {
  return ctx.loaders.transactionsByParticipationWithFilterSort.load({
    key: parent.id,
    filter: args.filter,
    sort: args.sort,
  });
}
```

---

## 3. DataLoader 命名規則（推奨）

| 種別           | 命名例                                     |
|----------------|--------------------------------------------|
| 単一取得        | `user`, `community`, `reservation`         |
| 複数取得（1:N） | `imagesByParticipation`, `transactionsByParticipation` |
| 複合キー取得    | `membershipByCompositeKey`                 |
| N:N取得         | `imagesByParticipation`, `tagsByArticle`   |

---

## 4. DataLoaderユーティリティ関数一覧

| 関数名                              | 主な用途・特徴                                      |
|--------------------------------------|-----------------------------------------------------|
| `createLoaderById`                   | 単一ID→単一リソース取得                             |
| `createNullableLoaderById`           | nullableなID対応の単一取得                          |
| `createLoaderByCompositeKey`         | 複合キー→単一リソース取得                          |
| `createHasManyLoaderByKey`           | 1:Nリスト取得、nullable外部キー対応                 |
| `createHasManyLoaderViaJoin`         | N:Nリスト取得、中間テーブル経由                     |
| `createFilterSortAwareHasManyLoaderByKey` | filter/sort付き1:Nリスト取得                    |

---

## 5. よくある誤用とその対策

| 誤用パターン                        | 問題点                                                 | 正しい対応法                                           |
|-------------------------------------|--------------------------------------------------------|--------------------------------------------------------|
| `loadMany(parent.id)`               | `loadMany` は ID 配列を取るが `parent.id` は単数       | → `load(parent.id)` を使う                             |
| `.load(parent.id)`（リストが必要な場面） | 単一Loaderを使って配列を返そうとしている               | → `createHasManyLoaderByKey` を使って設計する         |
| 複数形フィールドに単数Loaderを使う | 構造的に誤解を招く（例：`images` フィールドに `.load()`）| → 専用のリスト取得用Loaderを使う                       |
| N:Nリレーションで1:N Loaderを使う   | 中間テーブル経由のリスト取得に1:N Loaderを使うと誤動作 | → `createHasManyLoaderViaJoin` を使う                  |
| nullable外部キーでundefined扱い     | null/undefinedを考慮しないとLoaderがキャッシュミス     | → `createNullableLoaderById`やnullチェックを徹底       |

---

## 6. DataLoader設計のベストプラクティス

- `.load()` は「単一キー」を渡す：それが 1件でも N件でも Loader が制御する
- フィールドが複数形なら「リストを返す Loader」にする（例：`createHasManyLoaderByKey`）
- `loadMany()` は「複数の親キー」から一括取得したいときだけに使う
- N:Nリレーションは必ず中間テーブル経由Loaderを使う
- DataLoader の責務は「取得」、整形・変換は Presenter に分離する
- 型安全なLoader設計を徹底し、N+1問題を根本から防ぐ

---

## 7. 参考実装・Tips

- DataLoaderユーティリティは `src/presentation/graphql/dataloader/utils.ts` を参照
- Loaderの追加・拡張時はREADMEも必ず更新する
- Presenter/Service層との責務分離を守る
- 型定義・GraphQLスキーマとの整合性を常に意識する

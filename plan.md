# セッション処理バグ修正計画

## 前提確認

デプロイは GitHub Actions → Cloud Run 直接（Firebase Hosting 経由ではない）。
`constants.ts` の「Firebase Hosting expects '__session'」コメントは古い記述で、
現状の `__session_{communityId}` 方式はインフラ的に問題なし。

---

## 修正対象バグ（優先度順）

### Bug 1: `decodeURIComponent` がクラッシュしうる
**ファイル:** `src/presentation/middleware/auth/extract-headers.ts:19`

```typescript
// 現状 — %GG のような不正なパーセントエンコードで URIError がスロー
.map(([k, v]) => [k, decodeURIComponent(v || "")]),
```

**修正:** try-catch で包み、失敗時はそのままの値を返す。

```typescript
function safeDecodeURIComponent(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}
// ...
.map(([k, v]) => [k, safeDecodeURIComponent(v || "")]),
```

---

### Bug 2: セッションクッキーの失効チェックが無効
**ファイル:** `src/presentation/middleware/auth/firebase-auth.ts:37`

```typescript
// 現状 — checkRevoked=false のため失効済みトークンも14日間有効
tenantedAuth.verifySessionCookie(idToken, false)
```

**修正:** `checkRevoked: true` に変更。

```typescript
tenantedAuth.verifySessionCookie(idToken, true)
```

**トレードオフ:**
- パフォーマンス: リクエストごとに Firebase へ追加ネットワーク呼び出しが発生（~50–100ms）
- セキュリティ: パスワード変更・強制ログアウト後に即時セッション無効化が保証される

---

### Bug 3: `constants.ts` のコメントが誤解を招く
**ファイル:** `src/config/constants.ts:7–9`

```typescript
// 現状 — Cloud Run 直接デプロイなのに Firebase Hosting の制約を書いている
/**
 * Firebase Hosting expects "__session" as the cookie name
 */
```

**修正:** コメントを実態に合わせて更新。

---

## 修正しない判断をしたもの

| 項目 | 理由 |
|------|------|
| Firebase Hosting 非互換 | Cloud Run 直接デプロイなので該当しない |
| `communityId` が `string[]` になりうる | 通常 HTTP クライアントは同一ヘッダーを複数送らない。実被害なし |

---

## 実装手順

1. `extract-headers.ts` — `safeDecodeURIComponent` ヘルパーを追加して差し替え
2. `firebase-auth.ts` — `verifySessionCookie(idToken, false)` → `(idToken, true)` に変更
3. `constants.ts` — コメント更新
4. ブランチ `claude/fix-session-handling-bugs-Fe37s` にコミット・プッシュ

---

## テスト確認観点

- `decodeURIComponent` 修正: 不正パーセントエンコードのクッキーを持つリクエストで認証が落ちないこと
- 失効チェック修正: revoke済みUIDのセッションクッキーが `verifySessionCookie` で拒否されること

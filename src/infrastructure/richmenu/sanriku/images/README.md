# さんりくDAO リッチメニュー画像

デプロイ時にこのフォルダの PNG が LINE にアップロードされます。
以下の3ファイルを **2500 × 1686 px / PNG** で配置してください。

| ファイル名 | 対応メニュー                                  | タブ     |
| ---------- | --------------------------------------------- | -------- |
| `use.png`  | 使う（マイページ / 使い先を見る / MAPで見る） | 使う     |
| `earn.png` | 貯める（お手伝いリスト / お手伝い終了報告）   | 貯める   |
| `join.png` | 参加する（投票 / About Us / 社員権NFT購入）   | 参加する |

## 現状のリンク仕様

- リンクが有効なのは `use.png` の **マイページ** ボタンのみ（`${LIFF_BASE_URL}/users/me`）。
- それ以外のボタン（使い先を見る / MAPで見る / お手伝い系 / 投票 / About Us / 社員権NFT購入）は
  画像表示のみで、タップしても何も起きません（アクション未設定）。
- 上部3タブ（使う / 貯める / 参加する）の切り替えは全メニューで機能します。

リンク先を追加したくなったら `src/infrastructure/richmenu/sanriku/definitions/*.ts` の
各 `areas` に `uri` アクションを追加してください（izu の定義が参考になります）。

## デプロイ

```bash
pnpm richmenu:deploy --community=sanriku            # local
pnpm richmenu:deploy:dev --community=sanriku        # dev
pnpm richmenu:deploy:prd --community=sanriku        # prd
```

※ デプロイには `communityConfig.lineConfig`（accessToken / liffBaseUrl）が
`sanriku` コミュニティに登録済みである必要があります。

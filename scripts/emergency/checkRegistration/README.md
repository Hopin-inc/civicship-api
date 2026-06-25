# 登録状況チェック（確認専用 / 副作用なし）

KIBOTCHA住民証NFTの未登録者リスト（前回の `errors.csv`）を入力に、各電話番号が
**今 Firebase に登録されているか**だけを確認し、前回からの変化（登録が進んだ人数）を集計する。

`scripts/emergency/nftMint/` のミントスクリプトと違い、**ウォレット作成・DB書き込みは一切行わない**。
何度でも安全に実行できる。

## 背景

`scripts/emergency/nftMint/` は「Firebaseで見つかった人のウォレットを作成しDB保存する」副作用ありの
処理で、その過程で `FIREBASE_NOT_FOUND`（＝未登録）の人を `errors.csv` に書き出していた。

「未登録者に登録を促した後、何人が登録したか」だけを知りたいケースでは副作用が邪魔になるため、
照合（`auth.getUserByPhoneNumber`）のみを行うこのスクリプトを用意した。

## 使い方

```bash
# 前回の Errors CSV をそのまま入力にできる
pnpm emergency:check-registration <入力CSVパス> [出力ディレクトリ]

# 例: ダウンロードした errors CSV を食わせる
pnpm emergency:check-registration ./errors.csv

# 入力・出力を省略した場合のデフォルト
#   入力: scripts/emergency/checkRegistration/input.csv
#   出力: scripts/emergency/checkRegistration/output/
pnpm emergency:check-registration
```

`.env` 等の Firebase 認証情報（`FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`）が
読み込まれている必要がある。実行例:

```bash
dotenvx run -f .env.prd -- pnpm emergency:check-registration ./errors.csv
```

## 入力CSV

ヘッダ行の列名で自動判別するため、以下どちらの形式でも読める:

- 前回の Errors CSV: `phoneNumber,nftSequence,name,errorType,error`
- 元の input.csv: `phoneNumber,nftSequence,name`

電話番号は E.164（`+81...`）でも国内表記（`090...`）でも可。同一電話番号は1人として集約する
（NFT連番が複数行に分かれていても人数で数える）。

サンプル: [`input.sample.csv`](./input.sample.csv)

## 出力

`output/` ディレクトリに2ファイル生成（電話番号を含むためgit管理外）:

| ファイル | 内容 |
|---|---|
| `registered.csv` | 登録済みになった人（＝**前回からの変化分**）。`phoneNumber,name,firebaseUid` |
| `still-not-registered.csv` | まだ未登録の人。`phoneNumber,name,error` |

サマリ（人数・登録率）はログにも出力される。

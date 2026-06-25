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

入力・出力パスはパスインジェクションを避けるため固定値（リポジトリ内）にしている。
前回ダウンロードした Errors CSV を所定の場所に置いてから実行する。

```bash
# 1. 前回の Errors CSV を input.csv として配置（どちらの形式でもOK）
cp ./errors.csv scripts/emergency/checkRegistration/input.csv

# 2. 本番Firebaseに対して実行（出力は output/ に生成）
pnpm emergency:check-registration:prd
```

**本番環境前提**: KIBOTCHA住民さんは本番Firebaseで認証・登録しているため、
登録状況を見るには本番環境（`.env.prd`）に対して実行する必要がある。
`:prd` スクリプトは `confirmPrd.ts` の確認プロンプトを通したうえで `.env.prd` を読み込む
（このスクリプト自体は読み取り専用で、ウォレット作成・DB更新は行わない）。

```jsonc
// package.json
"emergency:check-registration:prd":
  "tsx scripts/confirmPrd.ts 'emergency:check-registration:prd' && dotenvx run -f .env.prd -- pnpm emergency:check-registration"
```

Firebase認証情報（`FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`）を
別途用意している場合は、env無しのベースコマンドも使える:

```bash
pnpm emergency:check-registration
```

| パス | 役割 |
|---|---|
| `scripts/emergency/checkRegistration/input.csv` | 入力（git管理外・要配置） |
| `scripts/emergency/checkRegistration/output/` | 出力先（git管理外） |

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

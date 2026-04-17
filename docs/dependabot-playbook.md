# Dependabot Playbook (civicship-api)

> This document is a skeleton. Full prose is written in a follow-up PR (PR-α3).

## 1. 目的と思想

- Security update は即時 merge、version update は保守的に判断
- 意図的 pinning は `pnpm.overrides` で表現(axios / lodash / fast-xml-parser 等)
- OSS × SaaS × 自治体/NPO 顧客帯を前提にした保守的運用

### 方針B(cooldown + grouping)を選んだ理由
- EOL 駆動の major bump(@apollo/server v4→v5 等)を自動検知するため
- 「脆弱性 fix が major にしかない」ケースで盲点を作らないため
- cooldown による supply chain 防御を layering するため
- `pnpm.overrides` で pin された依存も PR は来る運用。Playbook で close/更新を判断し、「定期棚卸し」を PR 駆動で代替

本設計プロセスは内部レビューログに保管、詳細判断基準は本 Playbook に集約。

## 2. 週次ルーティン

月曜朝に PR 一覧を開き、security → grouped → major の順に捌く。所要 30 分〜1 時間。

## 3. Security update PR 判断フロー

### Step 1. 脆弱性詳細の確認(vulnerable function/class 特定)
### Step 2. 現バージョンのリスク評価
### Step 3. 新バージョンの安全性(cooldown + maintainer/DL 数)
### Step 4. civicship-api への影響評価(該当シンボル grep)
### Step 5. 意図的 pinning の棚卸し(overrides と矛盾しないか)
### Step 6. EOL チェック(major bump 時)
- Apollo Server: https://www.apollographql.com/docs/apollo-server/previous-versions
- Node.js: https://endoflife.date/nodejs
- 他: endoflife.date で検索
- EOL or 間近 → upgrade は「義務」、通常フロー省略
### Step 7. 判断と記録

## 4. Alert dismiss 判断基準

`Dismiss > "Vulnerable code is not actually used"` を使う条件:
1. vulnerable function/class を特定
2. リポジトリで grep
3. 使用なし → dismiss、使用あり → 通常フロー

## 5. ケーススタディ

### Case 1: axios CVE-2026-40175 + NO_PROXY SSRF
既存 1.14.0 固定 → 1.15.0 へ更新した判断の記録。

### Case 2: fast-xml-parser 脆弱性塊 (Issue #665)
- Dependabot PR #796 (pnpm-lock 直書き換え) を close した理由: @google-cloud/storage 更新で戻るリスク
- overrides に `>=4.5.4` 追加: 下限強制で将来にわたり固定、意図が明示
- overrides コメント義務化:「特定版固定(最新警戒型)」「下限強制(脆弱版警戒型)」「互換性維持」

### Case 3: lodash 4.17.23 固定の棚卸し
「下限強制型」pinning の bump 運用例(4.17.23 → >=4.18.1)。

### Case 4: @apollo/server v4→v5 (EOL 駆動)
- version update を避ける方針の例外として EOL を扱う理由
- 事前確認3点: graphql peer / Express integration / startStandaloneServer 使用
- alert #49 を civicship-api に該当なしとした根拠(startStandaloneServer 未使用)

## 6. Overrides 記述ルール

全エントリにコメントで意図明記。類型:
- 「特定版固定(最新警戒型)」: axios
- 「下限強制(脆弱版警戒型)」: fast-xml-parser / lodash
- 「互換性維持」

四半期ごとに意図が生きてるか棚卸し。ignore リスト(追加時)も同時に見直し。

## 7. CI 環境

Postgres service container 経由で `db:generate --sql` を実行し、`@prisma/client/sql` サブパスを含む完全な型情報で typecheck。本番と同等の型解決を CI で担保。

**注意事項**: `prisma` / `@prisma/client` は caret range (`^6.6.0`) で宣言され、CI とローカルは `pnpm-lock.yaml` + `--frozen-lockfile` 経由で同一バージョンが保証される。ただし開発者が `--frozen-lockfile` 無しで install したタイミングで minor バージョンが変わり、`prisma format` 挙動の差で `schema.prisma` の diff 検出が誤検知する可能性がある。誤検知が実際に観測された場合は `prisma` を exact pin に切替、または `git diff --exit-code` 対象から `schema.prisma` を外す対応を検討する。

## 8. Phase 1 スコープ外の既知 alert (Phase 2 バックログ)

tar-fs / ws / node-forge 等長期放置の Development 依存系。本番影響度が低いため Phase 2 で一括棚卸し予定。

## 9. 緊急対応フロー

CVE 10.0 級の critical 脆弱性が発生し、cooldown 期間を待てない場合の手順。

### 判断基準
- CVSS 9.0 以上
- civicship-api の該当コードパスが実際に使用されている
- 公開されたエクスプロイトが存在する、または短期間で作成される見込み

### 手順(概要)
1. GitHub Security Advisory の詳細確認
2. `pnpm.overrides` で対象パッケージを fix 版に強制
3. PR-CI 通過確認(lint/typecheck/build)
4. master へ緊急 PR、通常レビュープロセス省略可
5. master merge 後、手動で prd workflow trigger
6. デプロイ後の health 確認(エラー率・レイテンシ 15 分観察)
7. Playbook に incident として記録追加

詳細は運用者の裁量。本 Playbook は判断材料を提供する。

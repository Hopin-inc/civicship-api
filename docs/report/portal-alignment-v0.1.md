# Portal ↔ Backend レポートロジック 差分シート v0.1

**Status:** v0.1 (backend 側既知関数のみ、portal `derive.ts` の 11関数突合せ前提)
**Last updated:** 2026-04-30
**Branch:** `claude/align-reporting-logic-HpsJF`
**Scope (current):** `src/application/domain/report/util.ts`, `report/transactionStats/weeklyAggregator.ts`, `analytics/community/{service,classifiers,aggregations}.ts`
**Out of scope (v0.1):** portal `CommunityDashboardOverview.tsx` インライン式群 — Phase 0 の関数抽出後に v1.0 で追記

---

## 0. 重要な前提(議論の前に確認すべきこと)

backend は **L1 ダッシュボード向けには「生カウント」を返し、portal 側で rate / threshold を派生させる設計**になっている。

ソース: `analytics/community/service.ts:42-58`

> "The L1 overview returns these as-is so the client derives rates / growth rates / threshold alerts on its own"
> "Exposing both halves lets the client compose churn alerts (e.g. churnedSenders > retainedSenders) without a server-side threshold judgement."

つまり portal の `derive.ts` / インライン式群が存在すること自体は **設計どおり**。差分シートが意味を持つのは以下の2用途:

- **(A) report-bot パイプライン**(週次バッチ・LLM 入力): backend `getAlerts`, `computeGrowthRates`, `computeRetentionSummary` などが「正」側
- **(B) L1 ダッシュボード**: backend は raw を返すだけ → portal の derive を「正」とし、backend は突合せ対象を持たない

→ **同じ概念名でも (A) と (B) で意図的に別計算になっている可能性がある**。突合せ時に「両者が同じ計算を意図しているか」を毎回確認する必要がある。

---

## 1. backend 側 純関数インベントリ

### 1.1 数値ユーティリティ

| 関数 | ファイル:行 | シグネチャ | 0/null 扱い |
|---|---|---|---|
| `percentChange` | `report/util.ts:102` | `(current: number, previous: number) => number \| null` | `previous === 0` → **`null`**(`Infinity`/`NaN`回避)。返り値は **%(×100済)** |
| `bigintToSafeNumber` | `report/util.ts:66` | `(value: bigint) => number` | `MAX_SAFE_INTEGER` 超で **throw**(silent precision loss を回避) |
| `rateOf` | `analytics/community/aggregations.ts:131` | `(senderCount: number, totalMembers: number) => number` | `totalMembers === 0` → **`0`**(non-nullable) |
| `computeActiveRate` | `report/transactionStats/weeklyAggregator.ts:149` | `(activeUsers: number, totalMembers: number) => number \| null` | `totalMembers ≤ 0` → **`null`** |

> ⚠️ **backend 内に既に2つの規約が並存している**: `rateOf`(0返し)と `computeActiveRate`(null返し)。前者は L1 ダッシュボード向け、後者は LLM ペイロード向け。**portal の derive とどちらを揃えるかは用途次第**。

### 1.2 集約

| 関数 | ファイル:行 | 入力 / 出力 | 備考 |
|---|---|---|---|
| `aggregateTransactionTotals` | `weeklyAggregator.ts:21` | `TransactionSummaryDailyRow[]` → `{txCount, pointsSum}` | BigInt で合計してから safe-narrow(行ごと narrow だと total が overflow しても素通り) |
| `computeAvgChainDepth` | `weeklyAggregator.ts:38` | `TransactionSummaryDailyRow` → `number \| null` | 分母は `chainRootCount + chainDescendantCount`(NULL 行は除外) |
| `computeRetentionSummary` | `weeklyAggregator.ts:53` | `{aggregate, totalMembers, week1, week4}` → `RetentionSummary` | `totalMembers <= 0` または `cohortSize === 0` で各 rate を **null** に collapse |
| `computeGrowthRates` | `weeklyAggregator.ts:95` | `{currentTxCount, currentPointsSum, currentActiveUsers, hasCommunityContext, previousAggregate}` → `{active_users, tx_count, points_sum}` | `active_users` は `hasCommunityContext === false` または前期間 0 で null。`tx_count` / `points_sum` も `percentChange` 経由で前期間 0 のとき null |
| `computeStageCounts` | `aggregations.ts:135` | `(members, thresholds)` → cumulative tier counts (tier1 ⊂ tier2) | classifier と単一定義 |
| `computeStageBreakdown` | `aggregations.ts:171` | `(members, thresholds)` → disjoint buckets, sums to 1.0 | `pointsContributionPct` も計算 |

### 1.3 分類 / 判定

| 関数 | ファイル:行 | ルール |
|---|---|---|
| `classifyMember` | `analytics/community/classifiers.ts:77` | `latent`(donationOutMonths===0) → `occasional`(daysIn < minMonthsIn×30) → `habitual`(rate≥tier1) → `regular`(rate≥tier2) → else `occasional` |
| `isDormant` | `classifiers.ts:112` | `lastDonationDay < truncateToJstDate(asOf) - dormantThresholdDays`(strict less-than、equality は active 扱い) |
| `getAlerts` | `analytics/community/service.ts:686` | (B) **report-bot 用**: 直近完了週 vs 前完了週で評価。L1 dashboard は使わない |

### 1.4 JST 日付ユーティリティ

| 関数 | ファイル:行 | 用途 |
|---|---|---|
| `truncateToJstDate` | `report/util.ts:20` | TIMESTAMPTZ → JST 暦日(UTC-encoded JST date 規約) |
| `daysBetweenJst` | `report/util.ts:36` | JST 暦日差(time-of-day 非依存) |
| `toJstIsoDate` | `report/util.ts:56` | → `YYYY-MM-DD` 文字列 |
| `isoWeekStartJst` | `report/util.ts:85` | DATE_TRUNC('week', ...) と一致する月曜00:00 JST |
| `jstMonthStart` / `jstMonthStartOffset` / `jstNextMonthStart` | `report/util.ts:125-142` | JST 月境界(SQL `::date AT TIME ZONE` と round-trip 可) |
| `formatJstMonth` | `report/util.ts:149` | → `YYYY-MM` 文字列 |
| `addDays` | `report/util.ts:25` | UTC 日付加算 |

### 1.5 定数 / 閾値

| 定数 | 値 | 場所 | 用途 |
|---|---|---|---|
| `ACTIVE_DROP_THRESHOLD` | `-0.2` (fraction) | `service.ts:87` | activeDrop 警告の MoM rate 閾値 |
| `NO_NEW_MEMBERS_WINDOW_DAYS` | `14` | `service.ts:88` | noNewMembers 警告のウィンドウ |
| `DEFAULT_SEGMENT_THRESHOLDS` | `{tier1: 0.7, tier2: 0.4, minMonthsIn: 1}` | `classifiers.ts:29` | habitual/regular 判定 |
| `MIN_MIN_MONTHS_IN` / `MAX_MIN_MONTHS_IN` | `1` / `120` | `classifiers.ts:35-36` | minMonthsIn 入力上下限 |
| `DAYS_PER_MONTH_APPROX` | `30` | `classifiers.ts:46` | minMonthsIn 月→日変換 |
| `COHORT_ACTIVATION_WINDOW_DAYS` | `30` | `aggregations.ts:91` | cohort funnel の activatedD30 |
| `DEFAULT_WINDOW_MONTHS` / `MAX_WINDOW_MONTHS` | `10` / `36` | `service.ts:77, 86` | 月次トレンド最大期間 |
| `DEFAULT_WINDOW_DAYS` / `MIN_WINDOW_DAYS` / `MAX_WINDOW_DAYS` | `28` / `7` / `90` | `service.ts:96-98` | L1 overview parametric window |
| `CHAIN_DEPTH_MAX_BUCKET` | `5` | `aggregations.ts:85` | chain depth ヒストグラム上限 |

---

## 2. portal 側 既知関数(derive.ts 11関数 + 主要派生)突合せ

> Phase 0 未完了のため `CommunityDashboardOverview.tsx` インライン式は v0.1 範囲外。

### 2.1 マッピング(暫定)

| portal 関数 | backend 等価 | 完全一致? | 確認が必要な差分 |
|---|---|---|---|
| `deriveTenuredRatio` | (該当なし — `classifyMember` と独立した tenure 派生? ) | ❓ | TENURE_THRESHOLD_DAYS の値 / 分母定義 |
| `computeStagePercentages` | `computeStageBreakdown` (`aggregations.ts:171`) | ❓ | bucket 定義(habitual/regular/occasional/latent)、`pct` 合計 1.0 規約 |
| `deriveAlerts` (3種) | `getAlerts` (`service.ts:686`) | ❌(意図的に別物) | (A) report-bot 用 vs (B) ダッシュボード用。**portal の閾値・ウィンドウを書き出して比較必要** |
| `aggregateVariantSummary` | (presenter 側、純関数ではない) | — | `ReportTemplateStatsBreakdownRow` GraphQL 型を入力にしているか |
| `buildCohortChartData` | (該当なし — backend は raw point 配列を返却) | ❌(設計どおり) | 派生は portal 専管 |
| (残り 6 関数) | — | ⏳ | portal 側からの一覧待ち |

### 2.2 ダッシュボードインライン式(Phase 0 抽出待ち)

| 概念 | backend 等価の有無 | 備考 |
|---|---|---|
| Pareto Top Share(coverage 達成ユーザー比率) | **なし** | backend `coverage` は LLM markdown coverage で別物(`report/util/coverage.ts`) |
| D30 初回送付率(直近Nコホート retentionM1 平均) | **PARTIAL** | `MonthlyCohortPoint.retentionM1` と `AnalyticsCohortFunnelPoint.activatedD30` を raw 提供。「直近N平均」は portal 派生 |
| 復帰率(`returnedMembers / 前月 dormantCount`) | **PARTIAL** | backend は `returnedMembers` / `returnedSenders` 生カウント提供。前月 dormant 分母は portal 派生 |
| 流通量 MoM | **PARTIAL** | 週次は `computeGrowthRates.points_sum`。月次版は未関数化 |
| 週次継続率 | **HAS(raw)** | `WeeklyRetentionPoint.{retainedSenders, churnedSenders}` で生提供 |
| 受領→送付転換率 | **未確認 / おそらくなし** | grep ヒットなし。portal 専管の可能性高 |
| `cohortDelta` 警告閾値 `-0.05` | **なし** | backend に同名閾値なし(ACTIVE_DROP_THRESHOLD は `-0.2`、別概念) |

---

## 3. 既知の "ハマりどころ"(突合せ時に必ずチェック)

1. **`percentChange` の単位** — backend の純関数は `× 100` 済みの「%」値を返すが、L1 ダッシュボード向け API (`growthRateActivity` 等、`service.ts:454`)では fraction に変換して返す箇所がある。portal 側で「どの backend フィールドと突き合わせるか」によって期待される単位が異なる点に注意。
2. **0 / null 規約の不統一** — backend 内ですら `rateOf`(0返し) と `computeActiveRate`(null返し)の2系統。portal がどちらに寄せているか要確認。
3. **alert ウィンドウ** — backend `getAlerts` は **直近完了週**(月曜火曜のノイズ回避)。portal が「現在進行週」で判定していたら毎週月曜に false positive が出る。
4. **JST 境界** — backend は `truncateToJstDate` で UTC-encoded-JST date 規約を厳守(SQL `@db.Date` と round-trip 可)。portal が naive `setUTCHours(0,0,0,0)` していたら 00:00–08:59 JST で off-by-one。
5. **`isDormant` の strict less-than** — equality は active 扱い。portal が `<=` だと境界日のメンバーが片側に倒れる。
6. **`bigintToSafeNumber` の throw** — backend は precision loss で throw、silent narrow しない。portal が `Number(bigint)` を直叩きしていたら大コミュニティで silent 破綻。
7. **`computeGrowthRates.active_users` の null collapse** — `hasCommunityContext === false` または比較対象の前期間が 0 のとき null。portal が常に値を期待していたら欠損。
8. **`minMonthsIn` の day vs month** — backend は `daysIn >= minMonthsIn × 30`(calendar month inflate を回避)。portal が `monthsIn >= minMonthsIn` だと 2日メンバーが habitual になる artifact が再発。

---

## 4. v1.0 への TODO

- [ ] **portal 側**: Phase 0 で `CommunityDashboardOverview.tsx` インライン式を関数化(`_shared/derive.ts` 等)
- [ ] **portal 側**: derive.ts 11関数の正確なシグネチャと 0/null 規約を提示
- [ ] **portal 側**: `cohortDelta -0.05` を含む全閾値定数の一覧
- [ ] **両者**: 上記 §3 の 8項目について 1関数ずつ突合せ
- [ ] **両者**: (A) report-bot パイプライン と (B) L1 ダッシュボード それぞれで「正」を決定(同名概念でも別計算になりうる)
- [ ] **backend 側**: 月次版 `computeGrowthRates` を関数化(現状はインライン式)
- [ ] **backend 側**: 復帰率(`returnedMembers / 前月 dormantCount`)を ad-hoc 派生にせず関数化するか判断

---

## 5. 共有形態の再検討材料

§1 の純関数群は **DB / DI に依存しない** ため抽出可能。ただし以下を考慮:

- backend では既に **CI ゴールデンテスト**(`pnpm ci:report-golden`)で振る舞いを固定済み
- 抽出時はゴールデン基盤を共有パッケージ側に移すか、backend が共有パッケージを参照する形に張り替えるかを決める必要あり
- まずは **TypeScript 型の共有**(`WeeklyReportPayload`, `RetentionSummary`, `AlertFlags`, `SegmentThresholds` 等)から始めるのが低リスク

---

## 付録: ファイル参照早見

```
src/application/domain/report/
├── util.ts                                  # JST helpers, percentChange, bigintToSafeNumber
├── transactionStats/weeklyAggregator.ts     # 集約純関数群
├── types.ts                                 # WeeklyReportPayload 等の型契約
└── util/coverage.ts                         # ※ LLM markdown coverage(portal Pareto と別物)

src/application/domain/analytics/community/
├── service.ts                               # AlertFlags, getAlerts, 閾値定数
├── classifiers.ts                           # classifyMember, isDormant, SegmentThresholds
└── aggregations.ts                          # rateOf, computeStageBreakdown, COHORT_ACTIVATION_WINDOW_DAYS
```

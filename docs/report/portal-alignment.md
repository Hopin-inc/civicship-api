# Portal ↔ Backend レポートロジック 差分シート v1.0

**Status:** v1.0 (portal `_shared/derive.ts` 全 export 突合せ完了、portal PR #1212 準拠)
**Last updated:** 2026-04-30
**Branch:** `claude/align-reporting-logic-HpsJF`
**Backend scope:** `src/application/domain/report/util.ts`, `report/transactionStats/weeklyAggregator.ts`, `analytics/community/{service,classifiers,aggregations}.ts`, `report/feedback/data/repository.ts`
**Portal scope:** `src/app/sysAdmin/_shared/derive.ts` (civicship-portal PR #1212, branch `claude/share-report-logic-4dazu`)

> **TL;DR — 即時対応が必要な発見**
> 1. **`minMonthsIn` の値が portal=3 / backend=1 でズレている**(`DEFAULT_SEGMENT_THRESHOLDS`)。同じメンバーが portal では `occasional`、backend LLM ペイロードでは `habitual` に分類されうる。**まず合意形成が必要**。
> 2. portal の L2 メトリクス(Pareto / Recovery / D30 / Weekly continuation series 等)は **backend 等価なし** — portal が raw counts から派生する設計どおり。共有対象から外す。
> 3. portal `deriveAlerts` と backend `getAlerts` は **意図的に別計算**(L1 ダッシュボード vs report-bot)。同名だが揃えてはいけない。


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

## 2. portal `_shared/derive.ts` × backend 突合せ(完全版)

凡例: ✅=完全一致 / ⚠️=部分一致 or 単位差 / ❌=backend 未実装(設計どおり) / ❗=値・規約が乖離

### 2.1 定数

| portal | 値 | backend 等価 | 値 | 一致? |
|---|---|---|---|---|
| `ACTIVE_DROP_THRESHOLD` | `-0.2` | `service.ts:87` `ACTIVE_DROP_THRESHOLD` | `-0.2` | ✅ |
| `TENURE_THRESHOLD_DAYS` | `90` | (なし、ただし `tenureDistribution` MV のバケット境界が 90 日) | — | ⚠️ MV 側と整合 |
| `DEFAULT_SEGMENT_THRESHOLDS.tier1` | `0.7` | `classifiers.ts:30` | `0.7` | ✅ |
| `DEFAULT_SEGMENT_THRESHOLDS.tier2` | `0.4` | `classifiers.ts:31` | `0.4` | ✅ |
| `DEFAULT_SEGMENT_THRESHOLDS.minMonthsIn` | **`3`** | `classifiers.ts:32` | **`1`** | ❗ **乖離** |
| `COHORT_M1_ALERT_THRESHOLD` | `-0.05` | (なし) | — | ❌ portal 専管 |
| `D30_COHORT_WINDOW` | `3` | (なし、ただし `COHORT_ACTIVATION_WINDOW_DAYS = 30` で D30 自体の定義は一致) | — | ⚠️ window 概念は portal 専管 |
| `FUNNEL_CONTINUING_MIN_MONTHS` | `2` | (なし) | — | ❌ portal 専管 |

> ❗ `minMonthsIn`: portal=3 ヶ月、backend=1 ヶ月。`classifyMember` の tenure floor が異なるので **同じメンバーでも分類が変わる**。詳細は §3 #9 / §6。

### 2.2 L1 メトリクス(rate 派生)

| portal 関数 | backend 等価 | 一致? | 備考 |
|---|---|---|---|
| `deriveActivityRate(row)` | `aggregations.ts:131` `rateOf(senderCount, totalMembers)` | ✅ | 両者とも分母 0 → 0(non-nullable)。L1 ダッシュボード規約 |
| `deriveActivityRatePrev(row)` | 同上(別の引数で再利用) | ✅ | 同上 |
| `deriveGrowthRateActivity(row)` | `service.ts:415,454` `getMonthActivityWithPrev.growthRateActivity` | ✅ | 両者 fraction 単位、totalMembers 0 OR prev 0 で null。**完全一致** |
| `deriveLatestCohortRetentionM1(row)` | (純関数なし、`LatestCohortCounts.{size, activeAtM1}` を raw 提供) | ❌ 設計どおり | portal が raw から派生 |
| `deriveHubUserPct(row)` | (なし、`hubMemberCount` を raw 提供) | ❌ 設計どおり | portal が raw から派生 |
| `deriveDormantRate({totalMembers, dormantCount})` | (なし、`dormantCount` を raw 提供) | ❌ 設計どおり | portal が raw から派生 |
| `deriveNewlyActivatedSenders(row)` | (なし、`windowActivity` から減算) | ❌ 設計どおり | portal の純減算 |
| `deriveChurnedSenders(row)` | 同上 | ❌ 設計どおり | 同上 |

### 2.3 L1 アラート

| portal 関数 | backend 等価 | 一致? | 備考 |
|---|---|---|---|
| `deriveAlerts(row).churnSpike` | `service.ts:737` `churnSpike` | ⚠️ ロジック同じ(`churned > retained`)、ウィンドウが異なる | portal: 現在進行週 / backend: 直近完了週 |
| `deriveAlerts(row).activeDrop` | `service.ts:738` `activeDrop` | ⚠️ 閾値は同じ `-0.2`、ウィンドウ・分母派生が異なる | portal: `growthRateActivity` (current vs prev window) / backend: prev-month rate vs prev-prev-month rate |
| `deriveAlerts(row).noNewMembers` | `service.ts:739` `noNewMembers` | ⚠️ 判定式は同じ(`=== 0`)、ウィンドウが異なる | portal: `windowActivity.newMemberCount` (28日 default) / backend: 直近 14 日(`NO_NEW_MEMBERS_WINDOW_DAYS`) |
| `hasAnyAlert(alerts)` | (なし、portal UI 専用) | ❌ | OR 集約 |

> 設計意図的に **(A) backend `getAlerts` は report-bot/LLM ペイロード用**、**(B) portal `deriveAlerts` は L1 ダッシュボード用** で別軸。同名だが揃えてはいけない。

### 2.4 L2 メトリクス(全て portal 専管・backend 等価なし)

| portal 関数 | backend 等価 | 確認結果 |
|---|---|---|
| `deriveRecipientToSenderRate(users, hasNextPage)` | ❌ なし | server-side 集計 endpoint があれば `hasNextPage` ガード不要に。要 backend 実装提案(§5) |
| `deriveAvgRecipients(activeMembers)` | ❌ なし | `uniqueDonationRecipients` は per-member raw 提供済。「active = `userSendRate > 0`」の定義は呼び出し側 filter |
| `deriveDonationMoM(monthlyTrend)` | ⚠️ 関連: `computeGrowthRates.points_sum` (週次・%単位) | portal は monthly・fraction 単位。**ウィンドウ + 単位ともに別物**。共有しない |
| `deriveCommunityAgeMonths(dataFrom, dataTo)` | ❌ なし、backend は `jstMonthStart` 等で **calendar month** を採用 | portal は **30日近似**(年が 12.17 ヶ月相当の誤差)。差は許容範囲だが認識合わせ必要 |
| `deriveAvgMonthlyThroughput(total, ageMonths)` | ❌ なし | portal 専管 |
| `deriveAvgMonthlyPerMember(throughput, totalMembers)` | ❌ なし | portal 専管 |
| `computeParetoTopShare(users, coverage)` | ❌ なし(backend `coverage` は LLM markdown coverage で別物) | portal 専管。default coverage は呼び出し側引数 |
| `deriveWeeklyContinuationRate(week)` | ❌ なし、`WeeklyRetentionPoint.{retainedSenders, churnedSenders}` raw 提供 | portal 派生(設計どおり) |
| `deriveWeeklyContinuationSeries(retentionTrend, windowSize)` | ❌ なし | 同上のシリーズ版 |
| `deriveCohortM1Delta(latest, prev)` | ❌ なし | portal 専管 |
| `isCohortM1Alert(delta)` | ❌ なし、閾値 `-0.05` も backend にない | portal 専管 |
| `deriveD30ActivationRate(cohortRetention, windowSize=3)` | ❌ なし、`MonthlyCohortPoint.retentionM1` を per-cohort raw 提供 | 「末尾N完了 cohort 平均」は portal 派生 |
| `deriveNewMemberRate(newMemberCount, totalMembers)` | ❌ なし | portal 専管 |
| `deriveRecoveryRate(latest, prev)` | ❌ なし、`returnedMembers` を raw 提供 | portal 派生(設計どおり) |
| `deriveRecoverySeries(monthlyTrend)` | ❌ なし | 同上のシリーズ版 |
| `deriveTenuredRatioFromMemberList(users, thresholdDays=90)` | ❌ なし、本来は `tenureDistribution` MV から | portal 注記どおり「暫定 fallback」 |
| `isRegularOverHabitual(habitual, regular)` | ❌ なし | UI 表示判定のみ |
| `deriveSentCount(totalMembers, latentCount)` | ❌ なし(`computeStageBreakdown` の latent bucket と整合) | portal 派生 |
| `countContinuingSenders(users)` | ❌ なし、`donationOutMonths >= 2` は backend 未関数化 | portal 専管 |

---

## 3. 既知の "ハマりどころ"(突合せ済み)

1. **`percentChange` の単位** — backend の純関数は `× 100` 済みの「%」値を返すが、L1 ダッシュボード向け API (`growthRateActivity` 等、`service.ts:454`)では fraction に変換して返す箇所がある。**確認結果**: portal `deriveGrowthRateActivity` は fraction 直返しなので、`growthRateActivity` API 値とは単位一致。✅
2. **0 / null 規約の不統一** — backend 内ですら `rateOf`(0返し) と `computeActiveRate`(null返し)の2系統。**確認結果**: portal `deriveActivityRate` は 0 返し → backend `rateOf`(L1 経路)と一致。✅
3. **alert ウィンドウ** — backend `getAlerts` は **直近完了週**(月曜火曜のノイズ回避)。portal `deriveAlerts` は **現在進行ウィンドウ**(`windowActivity`)。**意図的に別軸**(L1 ダッシュボード vs report-bot LLM)。揃えてはいけない。⚠️
4. **JST 境界** — backend は `truncateToJstDate` で UTC-encoded-JST date 規約を厳守(SQL `@db.Date` と round-trip 可)。portal が naive `setUTCHours(0,0,0,0)` していたら 00:00–08:59 JST で off-by-one。**未確認**: portal `deriveCommunityAgeMonths` は `new Date(string)` 直差分で JST-truncate していない(月数の丸め誤差は許容範囲だが原則は要確認)。⚠️
5. **`isDormant` の strict less-than** — equality は active 扱い。portal は `dormantCount` を raw 受領で派生していないので問題なし(server 計算済の `dormantCount` を使う)。✅
6. **`bigintToSafeNumber` の throw** — backend は precision loss で throw、silent narrow しない。portal は GraphQL 側で number 化済の値を受けるので影響なし。✅
7. **`computeGrowthRates.active_users` の null collapse** — `hasCommunityContext === false` または比較対象の前期間が 0 のとき null。portal が常に値を期待していたら欠損。**未確認**: portal は report-bot 経由の `WeeklyReportPayload` を消費していないので影響範囲は LLM 経路のみ。
8. **`minMonthsIn` の day vs month** — backend は `daysIn >= minMonthsIn × 30`(calendar month inflate を回避)。portal `derive.ts` は `classifyMember` 自体を持たず分類は backend に任せているので、portal 側の day/month バグは無し。✅
9. **❗ `minMonthsIn` のデフォルト値** — **portal=3 / backend=1** で乖離(`DEFAULT_SEGMENT_THRESHOLDS`)。portal の `DEFAULT_SEGMENT_THRESHOLDS` は SSR / hook / story の共通値で、backend の `classifyMember` には届かない(GraphQL 入力 `segmentThresholds` 経由で渡される想定)。問題は **portal が既定値で叩く時 と backend が `DEFAULT_SEGMENT_THRESHOLDS` を fallback で使う時の振る舞いが違う**こと。**用途別に正を決める必要あり**(§6)。

---

## 4. null / 0 規約の合意提案

突合せの結果、portal `derive.ts` 内の規約はすでに **「rate を返す関数のうち、`deriveActivityRate` / `deriveActivityRatePrev` / `deriveHubUserPct` だけが 0 返し、それ以外は null 返し」** で揺れている(`deriveDormantRate` / `deriveLatestCohortRetentionM1` / `deriveGrowthRateActivity` / `deriveNewMemberRate` / `deriveRecoveryRate` / `deriveDonationMoM` 等は全て null)。

backend 側も **2系統並存**: `rateOf`(0 返し、L1 ダッシュボード API 用) / `computeActiveRate`(null 返し、LLM ペイロード用)。

**提案**(backend → portal):

- **L1 ダッシュボード経路**: 現状維持で OK。portal `deriveActivityRate` (0返し) ↔ backend `rateOf` (0返し) が一致しているのは、L1 では「メンバー 0 のコミュニティ = 表示は 0%」という UX 判断に基づいた合意済の規約と読める
- **portal 内部の 0/null 不揃い**: `deriveHubUserPct` だけ 0 返しになっているのが他の rate (`deriveDormantRate` 等)と揃っていない。**portal 側で `deriveHubUserPct` を null 返しに揃える PR を切るのが妥当**(分母 0 のとき "0% は事実" ではなく "未定義"、と他の rate に合わせる)
- **新規追加する rate**: 原則 null 返し(分母 0 = 未定義)。`deriveActivityRate` パターン(0 返し)は既存 UX との互換のためだけに維持する

→ このポリシーで合意取れたら、portal 側で `deriveHubUserPct` null 化 PR を切ってもらう想定。

---

## 5. portal 側「微妙だが重要」な仕様の backend 状況

### 5.1 `aggregateVariantSummary` の加重平均母数

**確認結果**: backend の variant 集計は **server-side SQL で `AVG(rating)` per template_id**(`feedback/data/repository.ts:271, 305`)。breakdown 行はそれぞれ独立した SQL 集計の結果なので、**「avgRating != null の行のみで weighted average」というクライアント側問題は backend にはそもそも存在しない**。

ただし `repository.ts:494` で `weightedSum / totalCount`(rating 1-5 の histogram から加重平均を計算)という別の集計もあり、こちらは `totalCount === 0` で `null` 返し。null 行を除外した分母揺れの問題ではない。

→ portal 側の集計関数は **breakdown 行の二次集計**(複数 variant の合算)の話と推測。backend の SQL レイヤでは発生しないので、portal 側の null 行除外仕様は妥当。共有しない。

### 5.2 `deriveRecipientToSenderRate` の `hasNextPage` ガード

**確認結果**: backend に server-side 集計エンドポイントは **未実装**。portal は memberList limit 1000 で undersample されると分母過小評価 → null 返しでガードしている。

**提案**: backend 側で `recipientToSenderRate` を server 集計するエンドポイントを追加すれば、portal は API 値をそのまま使えて hasNextPage ガードが不要になる。優先度は portal 側で「実データで limit 1000 に到達するコミュニティが何件あるか」次第。要 portal 側の判断。

---

## 6. ❗ `minMonthsIn` 乖離の取り扱い

| 経路 | 既定値 | 影響 |
|---|---|---|
| portal L1 ダッシュボード(`segmentThresholds` 引数で backend に渡す) | `3` | backend `classifyMember` に `{minMonthsIn: 3}` が渡る |
| backend LLM ペイロード(`classifyMember` を fallback で使う場合) | `1` | report-bot は backend デフォルトで分類 |

**問題**: 同じメンバー(daysIn = 60)が

- L1 ダッシュボード: `daysIn(60) < 3 × 30(=90)` → `occasional` に降格
- report-bot LLM: `daysIn(60) >= 1 × 30(=30)` → rate 次第で `habitual`/`regular`

**選択肢**:
- (A) backend のデフォルトを `3` に揃える(portal の運用判断「短期在籍 artifact 排除」を採用)
- (B) portal のデフォルトを `1` に揃える(backend のドメインモデルの初期値を尊重)
- (C) 別物として明示的に保持(L1 と LLM で分類意図が違う、と documentation する)

**backend からの推奨**: **(A)**。portal の comment "短期在籍 artifact (1 ヶ月で 1 回送って habitual 扱い) を運用上排除" は backend 側の `classifiers.ts:50-63` の同じ artifact ガードと意図が一致。backend デフォルトの `1` は domain の最小値で、UI 既定値としては緩すぎる。要 portal 側の合意。

→ 合意できれば backend で `DEFAULT_SEGMENT_THRESHOLDS.minMonthsIn = 3` に変更する小 PR を切ります。

---

## 7. 次アクション(両チーム宛)

### portal 側
- [ ] `deriveHubUserPct` を null 返しに揃える小 PR を切る(§4)
- [ ] `minMonthsIn` を 3 で固定する運用方針が長期的に正しいか確認(§6)
- [ ] limit 1000 到達コミュニティの実データ確認 → server-side 集計を backend に依頼する優先度判断(§5.2)

### backend 側(本リポ・後続 PR)
- [ ] §6 の合意が取れたら `DEFAULT_SEGMENT_THRESHOLDS.minMonthsIn = 3` に変更
- [ ] 月次版 `computeGrowthRates`(現状は週次のみ純関数化)を関数化するか判断 — portal 側 `deriveDonationMoM` と仕様が異なるので共有しない方針なら不要

### 両者
- [ ] §6 の `minMonthsIn` 規定を合意してドキュメント化
- [ ] §3 #4 / #7 の「未確認」項目を解消

---

## 8. 共有パッケージ化の現状判断

§2 の突合せ結果より、**共有候補として有意義なのは以下のみ**:

| 候補 | 共有形態 | 優先度 |
|---|---|---|
| `ACTIVE_DROP_THRESHOLD = -0.2` | 定数共有 | 中(値は一致しているが運用ウィンドウが違うので別軸の方が混乱が少ない可能性) |
| `DEFAULT_SEGMENT_THRESHOLDS` | 定数共有(`minMonthsIn` 揃えた後) | 高 |
| `WeeklyReportPayload` / `RetentionSummary` / `AlertFlags` / `SegmentThresholds` 型 | TypeScript 型共有 | 高(低リスク) |
| `percentChange` / `bigintToSafeNumber` / JST date helpers | 純関数共有 | 低(各々の use case が局所的) |
| L2 メトリクス関数群 | (共有なし) | — portal 専管が設計 |

→ **段階的に**: まず TypeScript 型共有から始め、定数共有(minMonthsIn 合意後)、最後に純関数共有を必要に応じて追加。CI ゴールデンテスト(`pnpm ci:report-golden`)を共有パッケージ側に移すか backend で参照に張り替えるかは、純関数共有の段で改めて議論。

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

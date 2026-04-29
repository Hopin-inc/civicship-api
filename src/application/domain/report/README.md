# report ドメイン — 計算ロジック解説

このドキュメントは、`report` および `report` を再利用する `analytics` ドメインで使われる
**集計・分析クエリの計算ロジック**を日本語でまとめたものです。
新しい分析メソッドを追加する際は、本ドキュメントを参照して既存パターンと整合させてください。

> 設計の意図やレイヤー責務は `CLAUDE.md` を参照。
> 本ドキュメントはあくまで「実装上の計算式と境界条件」に焦点を当てています。

---

## 0. 設計前提

### 退会がない構造
プラットフォームの多くのコミュニティでは退会が発生しません。
そのため、**`MembershipStatus.LEFT` は実運用では出現しない前提**で集計式を設計しています。
分母となる `total_members` はすべて `status = 'JOINED'` でフィルタ。

### LTV の唯一変数は月次送信率
在籍期間がほぼ全員共通のため、LTV を決めるのは「何ヶ月に 1 回 DONATION を送るか」だけ。
これが個人指標 `userSendRate` と、コミュニティ指標 `communityActivityRate` の意味の核です。

### 「個人」と「コミュニティ」の指標分離
混同しやすいので必ず区別する:

| 指標 | 単位 | 計算式 |
|---|---|---|
| `userSendRate` | 個人 | `donation_out_months / months_in` |
| `communityActivityRate` | コミュニティ | `直近月のsender数 / 月末時点のtotal_members` |

GraphQL スキーマでは命名で区別 (`SysAdminMemberRow.userSendRate` vs
`SysAdminCommunityOverview.communityActivityRate`)、description にも常に注記。

---

## 1. JST タイムゾーンの扱い

### 1.1. 二段階変換パターン

すべての日付集計で以下のパターンを使用:

```sql
(t."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date
```

- `created_at` は naive UTC timestamp (`timestamp WITHOUT time zone`)
- 1 段目 `AT TIME ZONE 'UTC'` で UTC 時刻として解釈 → timestamptz
- 2 段目 `AT TIME ZONE 'Asia/Tokyo'` で JST 表記に変換 → naive timestamp

> ⚠️ 単段の `AT TIME ZONE 'Asia/Tokyo'` は **値を JST と解釈してしまう**ため、
> 00:00〜08:59 JST のレコードが前日に分類される。
> 過去の MV バグは `migrations/20260416000001_fix_report_views_jst_bucketing/` で修正済み。

### 1.2. 境界値を SQL に渡すパターン

JST 月初 / 週初 などの境界値を SQL に渡すときは **「JST 日付を UTC midnight に encode した Date」** を使う。
TS 側の helper:

| 関数 | 返り値 |
|---|---|
| `truncateToJstDate(d)` | `d` の JST 暦日の 00:00 を UTC midnight として返す |
| `isoWeekStartJst(d)` | `d` を含む ISO 週の月曜 00:00 JST（同上の encode） |
| `jstMonthStart(d)` | `d` を含む JST 月の 1 日 00:00（同上の encode） |
| `jstMonthStartOffset(d, n)` | n ヶ月オフセットした JST 月初 |
| `jstNextMonthStart(d)` | 翌月の JST 月初 |

repository 側ではこれを受け取って `::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC'` で
naive UTC timestamp に変換して比較:

```sql
AND m."created_at" < (${jstUpper}::date AT TIME ZONE 'Asia/Tokyo' AT TIME ZONE 'UTC')
```

> ⚠️ raw な JS `Date` を直接渡すと、UTC 15:00–23:59 のとき `::date` の結果が JST 翌日になり、
> 1 日ずれる。必ず `truncateToJstDate` 経由で渡すこと。

### 1.3. 半開区間の徹底
日付窓は常に `[from, to)` の半開区間で表現する:

- 「直近 N 日間」 → `[asOfJstDay - (N-1)日, asOfJstDay + 1日)` で N 日ちょうど
- 「ある月」 → `[monthStart, nextMonthStart)`
- 「ある週」 → `[weekStart, weekStart + 7日)`

`<= asOf::timestamp` のような閉区間と JST 日単位の `< (...)::date` を
混在させると `findMemberStatsBulk` と `findActivitySnapshot` で精度がズレるので統一する。

---

## 2. 主要な指標の計算式

### 2.1. `userSendRate`（個人の月次送信率）

```
userSendRate = donation_out_months / months_in
```

- `donation_out_months`：そのユーザーが DONATION-out を送った **distinct な JST 月数**
- `months_in`：在籍した **distinct な JST 月数**（後述）

返却値は小数点 3 桁に丸める（SQL 側で `ROUND(..., 3)`）。

### 2.2. `months_in`（在籍月数）

入会月から asOf 月までの **inclusive なスパン**:

```
months_in = (asOf 年 − created_at 年) × 12
          + (asOf 月 − created_at 月)
          + 1
```

- 2025-03-15 入会、asOf 2025-04-10 → `months_in = 2`（3 月と 4 月、2 ヶ月在籍）
- 2026-04-21 入会、asOf 2026-04-21 → `months_in = 1`（当月のみ、最小値 1）
- `GREATEST(1, ...)` で防御的に最小値 1 を保証

> ⚠️ `+1` を忘れると `donation_out_months > months_in` となり `userSendRate > 1.0` になる。
> 過去のバグでは「3 月と 4 月で donate した人が `userSendRate = 2.0`」が起きた。

### 2.3. `communityActivityRate`（コミュニティ月次稼働率）

```
communityActivityRate = 直近月の DONATION sender 数 / 月末時点の total_members
```

- 分子：`mv_user_transaction_daily` で `donation_out_count > 0` の DISTINCT user_id
- 分母：`t_memberships` で `created_at < (月末翌日 JST 00:00)` の `JOINED` メンバー数

> ⚠️ 過去 / 現在進行中の月では分母を **asOf 当日まで**にクランプする必要がある。
> `findMonthlyActivity` の `member_upper = LEAST(next_month_start, asOf+1日)` パターンを参照。

### 2.4. `growthRateActivity`（前月比 — UI 用 informational signal）

```
growthRateActivity = (currRate − prevRate) / prevRate
```

- `prev.totalMembers === 0` または `prevRate === 0` のとき **null を返す**
- そのまま割ると `Infinity` になり、GraphQL `Float` がエラーを返す

> ⚠️ **これはダッシュボードに出す表示用の値**で、**`activeDrop` アラートの判定には使わない**。
> アラートは「進行中月を対象にしない」ため、current vs prev ではなく
> prev vs prev-prev で判定する（§4 参照）。
> 同じ「前月比」でも表示用とアラート用で参照期間が違う点に注意。

### 2.5. `community_activity_rate_3m_avg`（3 ヶ月移動平均）

直近 3 ヶ月の `communityActivityRate` の単純平均。
データが 3 ヶ月分未満のときは null を返す。

---

## 3. retention の計算

### 3.1. `is_sender` / `is_receiver` の定義

retention 系のすべての判定は **DONATION のみ**を対象とする:

- `is_sender` ⇔ `donation_out_count > 0`
- `is_receiver` ⇔ `received_donation_count > 0`

> ⚠️ `tx_count_out > 0` だと ONBOARDING / GRANT による発行も含むので、
> peer-to-peer engagement の指標として誤った値になる。
> MV のカラム名にだまされないこと。

### 3.2. 週次 retention の各カウンタ

`findRetentionAggregate` は単一週に対して以下を返す:

| カウンタ | 意味 |
|---|---|
| `retained_senders` | 今週も先週も sender だった人数 |
| `churned_senders` | 先週は sender だが今週は止まった人数 |
| `returned_senders` | 今週 sender、先週は止まっていたが、過去 12 週以内に sender だった人数 |
| `current_senders_count` | 今週 sender だった人数 |
| `current_active_count` | 今週 sender または receiver だった人数 |
| `new_members` | 今週 `t_memberships.created_at` が落ちた人数 |

### 3.3. `ever_before` の 12 週制限

`returned_senders` 判定で「過去に sender だったか」を見るとき、
**直近 12 週まで** で打ち切る:

```sql
ever_before AS (
  SELECT DISTINCT "user_id"
  FROM "mv_user_transaction_daily"
  WHERE "date" >= ${twelveWeeksAgo}::date
    AND "date" <  ${prevWeekStart}::date
    AND "donation_out_count" > 0
)
```

理由：歴の長いコミュニティで全期間 DISTINCT すると MV のフルスキャンになる。
13 週以上前にしか活動がなかった人は returned に分類しない（既存ユーザーとみなす）トレードオフ。

### 3.4. 月次コホート retention

「入会月 m に joined した人のうち、月 m+1 / m+3 / m+6 に DONATION を送った人の割合」を計算。

進行中の月は除外する:

```ts
if (activeEnd > latestMonthStart) return null;
```

理由：asOf を含む月は完了していないので、retention が不当に低く出る。
完了済みの月のみ評価することで、外部報告で使える正確な数値になる。

#### L1 の `latestCohortRetentionM1` も同じ規則

L1 ダッシュボードに出る「直近コホート retention_m1」も、**asOf 月を
active 期間として扱うと同じ問題**が起きるため、cohort を 1 ヶ月
遡らせて「2 ヶ月前に joined した人の 1 ヶ月後 retention（= 先月中の
DONATION 送信率）」として算出する。active 期間は asOf 月の直前で
終わる完了月になるため、L2 の `activeEnd > latestMonthStart` ルールと
整合する。

---

## 4. アラート判定

集計指標を組み合わせた boolean フラグは **API 側で確定**してから返す
（フロントは表示するだけ）。

| フラグ | 条件 | 判定対象期間 |
|---|---|---|
| `churnSpike` | `churned_senders > retained_senders` | **直近の完了済み週** vs その前の週 |
| `activeDrop` | 月次稼働率の変化 `<= -20%` | **直近の完了済み月** vs その前の月 |
| `noNewMembers` | 直近 14 日間（JST）に `JOINED` が 0 件 | `asOf` を終点に含む 14 日間 |

> ⚠️ **進行中の週 / 月はアラート判定の対象にしない**。
> asOf を含む週 / 月を対象にすると、週の月曜や月初で
> データ蓄積が途中のまま完了期間と比較してしまい、
> 毎週 / 毎月の週頭・月初で必ず誤検知する。
> 判定は常に「完了済み直近期間」を参照する。
> UI に出す `growthRateActivity`（current vs prev）は別の informational signal として維持される。

### 4.1. `noNewMembers` 窓の作り方

正確に「14 日間」にするための半開区間:

```ts
const asOfJstDay = truncateToJstDate(asOf);
const fourteenDaysAgo = addDays(asOfJstDay, -(14 - 1));   // 13 日前
const upperExclusive = addDays(asOfJstDay, 1);            // 翌日 0:00 JST
// 窓 = [fourteenDaysAgo, upperExclusive) = 14 日ちょうど
```

> ⚠️ 過去のバグ:
> - `addDays(latestWeekStart, -14)` 起点 → 窓が 14〜21 日に可変
> - `addDays(asOfJstDay, -14)` + `asOfJstDay + 1` → 15 日窓（off-by-one）

### 4.2. `activeDrop` のゼロ除算ガード

`activeDrop` は **prev-month rate vs prev-prev-month rate** で判定する
（§4 の表参照）。次のいずれかで `null` を返し、アラートは発火させない:

- `prevPrevMonth.totalMembers === 0`（prev-prev 月にメンバーがいない）
- `prevPrevRate === 0`（prev-prev 月の稼働率が 0）

`percentChange(prevRate, prevPrevRate)` が内部で `null` を返すケースと
同じで、そのまま割ると `Infinity` になり GraphQL `Float` がエラーになる。

---

## 5. ステージ分類（analytics）

`userSendRate` の閾値で 4 段階に分類:

| ステージ | 条件 |
|---|---|
| `latent` | `donation_out_months === 0`（未参加） |
| `occasional` | `0 < userSendRate < tier2`（散発参加） |
| `regular` | `tier2 <= userSendRate < tier1`（定期参加） |
| `habitual` | `userSendRate >= tier1`（習慣化） |

デフォルト閾値：`tier1 = 0.7`、`tier2 = 0.4`。
**閾値はフロントから input で受け取る** — サーバ側に固定値を埋め込まない。

### 5.1. 累積 (cumulative) と分割 (disjoint) の使い分け

| 用途 | 計算方法 |
|---|---|
| `SegmentCounts.tier1Count` / `tier2Count` | `userSendRate >= tier1`（または tier2）の人数（**累積**） |
| `StageBreakdown.{habitual, regular, occasional, latent}` | 4 バケツに**排他的**に分類、`pct` の合計 = 1.0 |

L1 dashboard の表示用には累積、L2 詳細の構成比表示には disjoint を使う。

---

## 6. レイヤー責務

`CLAUDE.md` の規則を実装で守るためのチェック:

### 6.1. UseCase
- ✅ Service と Presenter のみ呼ぶ
- ❌ Repository を直接呼ばない（Service に thin pass-through を追加すること）

### 6.2. Service
- ✅ 自ドメインの Repository を呼ぶ
- ✅ 他ドメインの **Service** を呼ぶ（read 専用）
- ❌ 他ドメインの **Repository** を直接呼ばない

例：`SysAdminService` は `ReportService.getRetentionAggregate` を呼ぶ
（`ReportRepository.findRetentionAggregate` を直接呼んではいけない）。

### 6.3. Repository
- ✅ Prisma クエリを実行
- ✅ `ctx.issuer.public()` / `internal()` で RLS をバイパス
- ❌ ビジネスロジックを書かない（フィルタ・ソート・ページングは Service へ）

---

## 7. パフォーマンス

### 7.1. fan-out 戦略

- L1 dashboard (community 軸 fan-out)：`*Bulk` メソッドで `GROUP BY
  community_id` の単一 SQL 化済み (`AnalyticsCommunityRepository.findMemberStatsBulk` 等、
  `ReportRepository.findRetentionAggregateBulk` 等)。コミュニティ数に
  依らず 1 ラウンドトリップ
- 週次 retention / 月次 cohort のループ（〜43 週 / 〜36 ヶ月）は per-time-window
  ループのまま。MV のインデックス `(community_id, date)` が効くので並列小
  クエリで十分速い（`scripts/sysadmin_bench.ts` の計測：時間軸 bulk 化は
  364x 遅化したので revert）

### 7.2. `windowMonths` の上限

`getCohortRetention` は 1 ヶ月あたり 4 SQL 発行するので、
input に上限を設ける（`MAX_WINDOW_MONTHS = 36`）。

---

## 8. よくある落とし穴（過去のバグから）

| 症状 | 原因 | 対処 |
|---|---|---|
| `userSendRate > 1.0` | `months_in` の `+1` 忘れ | `months_in` を inclusive スパンに |
| 過去 asOf でメンバー数が膨らむ | repo の `members` CTE に `created_at <= asOf` が無い | 各クエリで asOf clamp を統一 |
| `noNewMembers` が誤検出 | 14 日窓が 14〜21 日 / 15 日に可変 | `[asOfJstDay-13, asOfJstDay+1)` で 14 日ちょうど |
| `growthRateActivity` が `Infinity` | `prevRate === 0` で割り算 | 明示的に null を返す |
| 日付が 1 日ずれる | raw JS `Date` を repo に渡している | `truncateToJstDate` 経由で JST-encoded に |
| L1 と L2 で `totalMembers` が違う | クエリ間で precision が `<= timestamp` と `< date` で混在 | JST 日単位で統一 |
| Build が失敗 (TS1005) | SQL コメント内に `` ` `` を使った | バッククォートを除去（template literal を閉じる） |
| cohort retention が不当に低い | 進行中月を含めて評価 | `activeEnd > latestMonthStart` で除外 |

---

## 9. 関連ファイル

| パス | 内容 |
|---|---|
| `src/application/domain/report/util.ts` | JST 日付ヘルパー、`bigintToSafeNumber`、`percentChange` |
| `src/application/domain/report/transactionStats/data/repository.ts` | retention / cohort / period aggregates の中核実装（`findRetentionAggregate` / `findRetentionAggregateBulk` 等） |
| `src/application/domain/analytics/community/data/repository.ts` | `findMemberStatsBulk` / `findMonthlyActivity` / `findWindowActivityCountsBulk` などの analytics 固有クエリ |
| `src/application/domain/analytics/community/service.ts` | アラート判定・ステージ分類・トレンド orchestrator |
| `scripts/sysadmin_bench.ts` | 週次 retention のローカル計測スクリプト（旧 sysadmin 命名のまま） |
| `src/infrastructure/prisma/migrations/20260416000001_fix_report_views_jst_bucketing/` | JST バケツバグの修正履歴 |

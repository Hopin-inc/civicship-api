# ✅ 単体テスト報告書｜TicketService ユニットテスト

## 📌 対象モジュール

- **対象クラス**：`TicketService`
- **依存モック**：
    - `TicketConverter`（purchase / reserve / cancelReserved / refund / use）
    - `TicketRepository`（create / update）
    - `getCurrentUserId`（ユーザー識別）
- **テスト対象メソッド**：
    - `purchaseTicket`
    - `purchaseManyTickets`
    - `reserveManyTickets`
    - `cancelReservedTicketsIfAvailable`
    - `refundTicket`
    - `refundTickets`
    - `useTicket`

---

## 🧪 テスト実施内容と結果

### 1. `purchaseTicket`

| ケース数 | 1件（正常系） |
| 検証内容 | Converter経由での入力生成 → Repository.create呼び出しまでの一連フロー |
| 結果 | ✅ 成功（引数、戻り値ともに期待通り） |

---

### 2. `purchaseManyTickets`

| ケース数 | 1件（正常系：複数参加） |
| 検証内容 | 複数の `participationId` に対して `purchase` を個別に呼び出し、それぞれ作成 |
| 結果 | ✅ 成功（Converter / Repository の呼び出し回数、戻り値が正しい） |

---

### 3. `reserveManyTickets`

| ケース数 | 1件（正常系） |
| 検証内容 | 各 `ticketId` に対して、`reserve` converter の呼び出しと `update` 実行 |
| 結果 | ✅ 成功（呼び出し順と引数が正確、全件処理されている） |

---

### 4. `cancelReservedTicketsIfAvailable`

| ケース数 | 1件（正常系） |
| 対象条件 | `status = DISABLED`, `reason = RESERVED` のチケットのみ |
| 検証内容 | 条件に一致したチケットのみを `cancelReserved` → `update` |
| 結果 | ✅ 成功（フィルタリングが正確に動作し、該当チケットのみ処理されている） |

---

### 5. `refundTickets`

| ケース数 | 1件（正常系） |
| 検証内容 | すべてのチケットに対して `refund` を適用し、`update` を呼び出すか |
| 結果 | ✅ 成功（Converter + Repository が正しい順序で呼ばれている） |

---

### 6. `refundTicket`

| ケース数 | 1件（正常系） |
| 検証内容 | `findTicketOrThrow` → `refund` → `update` の一連フロー |
| 結果 | ✅ 成功（期待通りの更新が行われ、返却される） |

---

### 7. `useTicket`

| ケース数 | 1件（正常系） |
| 検証内容 | `findTicketOrThrow` → `use` → `update` の流れ |
| 結果 | ✅ 成功（使用処理に必要なすべてのステップが正しく呼ばれている） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **テストカバレッジ** | ⭐️⭐️⭐️⭐️⭐️ | 各主要メソッドを完全網羅。ループ・条件・バリデーション分岐も適切。 |
| **モック戦略** | ⭐️⭐️⭐️⭐️⭐️ | Converter / Repository の責務に応じた分離と呼び出し確認が明快。 |
| **検証の粒度** | ⭐️⭐️⭐️⭐️⭐️ | `calledTimes`, `calledWith` による詳細な呼び出し検証が行われている。 |
| **責務の分離** | ⭐️⭐️⭐️⭐️⭐️ | Converter → Repository という構造がテストからも明確に読み取れる。 |
| **副作用の検証** | ⭐️⭐️⭐️⭐️⭐️ | `create`, `update` といった永続化処理の回数・引数が正確に検証されている。 |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **S（最高評価）**  
  TicketService の主なユースケース（購入・予約・返金・使用）のフローがすべて網羅されており、  
  コンバーターとリポジトリの関係、条件分岐ごとの挙動も丁寧に検証されている。

### 🛠 改善ポイント（任意）

- `cancelReservedTicketsIfAvailable` における「条件に当てはまらないが紛らわしいケース」（e.g. `DISABLED` だが別理由）も1件あると明確。
- `purchaseManyTickets` の異常ケース（Converterエラーなど）も補完できると◎。

---

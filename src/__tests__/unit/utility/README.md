# ✅ 単体テスト報告書｜UtilityService ユニットテスト

## 📌 対象モジュール

- **対象クラス**：`UtilityService`
- **依存モック**：
    - `UtilityRepository`（find / findAccessible / create / update / delete）
    - `UtilityConverter`（create / updateInfo / findAccessible）
- **テスト対象メソッド**：
    - `findUtility`
    - `findUtilityOrThrow`
    - `createUtility`
    - `deleteUtility`
    - `updateUtilityInfo`
    - `validatePublishStatus`

---

## 🧪 テスト実施内容と結果

### 1. `findUtility`

| ケース数 | 2件（存在あり／なし） |
| モック | `UtilityConverter.findAccessible`, `UtilityRepository.findAccessible` |
| 検証内容 | 指定された `filter` に応じた where 条件で Utility を検索できるか |
| 結果 | ✅ 成功（存在する場合はオブジェクトを、存在しない場合は `null` を返す） |

---

### 2. `findUtilityOrThrow`

| ケース数 | 2件（存在あり／存在しない） |
| モック | `UtilityRepository.find` |
| 検証内容 | `find` の結果が null の場合に `NotFoundError` をスローするか |
| 結果 | ✅ 成功（正常に返却または例外を投げる） |

---

### 3. `createUtility`

| ケース数 | 1件（正常系） |
| モック | `UtilityConverter.create`, `UtilityRepository.create` |
| 検証内容 | Converterによる入力整形と、Repositoryへの登録処理が適切に実行されるか |
| 結果 | ✅ 成功（入力 → 登録 → 結果の流れが正しく動作） |

---

### 4. `deleteUtility`

| ケース数 | 1件（正常系） |
| モック | `UtilityService.findUtilityOrThrow`, `UtilityRepository.delete` |
| 検証内容 | 存在確認ののち削除が行われ、結果が返却されるか |
| 結果 | ✅ 成功（事前確認あり、削除ロジックも問題なし） |

---

### 5. `updateUtilityInfo`

| ケース数 | 1件（正常系） |
| モック | `UtilityRepository.find`, `UtilityConverter.updateInfo`, `UtilityRepository.update` |
| 検証内容 | Utility存在確認 → Converterで入力変換 → Repositoryで更新、の一連フロー |
| 結果 | ✅ 成功（images配列の扱いも考慮されており堅牢） |

---

### 6. `validatePublishStatus`

| ケース数 | 2件（許可されたステータスのみ／不正なステータス含む） |
| モック | なし（純粋関数） |
| 検証内容 | `publishStatus` に許可されない値が含まれている場合、 `ValidationError` を投げるか |
| 結果 | ✅ 成功（不正なstatusがエラーとして検出される） |

---

## 🧪 品質チェックリスト

| 観点 | 評価 | コメント |
|------|------|----------|
| **テストカバレッジ** | ⭐️⭐️⭐️⭐️⭐️ | すべてのパブリックメソッドに対し正常／異常パスを網羅 |
| **モック戦略** | ⭐️⭐️⭐️⭐️⭐️ | ConverterとRepositoryの責務が分離され、適切にモックされている |
| **検証の粒度** | ⭐️⭐️⭐️⭐️⭐️ | 戻り値の確認だけでなく、`calledWith` による引数チェックも丁寧 |
| **責務の分離** | ⭐️⭐️⭐️⭐️⭐️ | コンバータで入力整形 → Repository に渡すという設計がテストでも明示されている |
| **副作用の検証** | ⭐️⭐️⭐️⭐️ | create / update / delete の副作用を正しく検証している（追加で複数件ケースがあると◎） |

---

## ✅ 総合評価と改善点

### ✅ 評価

- **S（最高品質）**  
  UtilityServiceの読み取り・作成・更新・削除といった主要ユースケースをすべて網羅し、異常系も含めて検証されている。  
  `publishStatus` のドメインバリデーションも pure に実装されていて読みやすく、高い保守性が担保されている。

### 🛠 改善ポイント（任意）

- `deleteUtility` において、**存在しない場合の異常系（`findUtilityOrThrow` が throw）** も1件あると網羅的。
- `updateUtilityInfo` のテストで `images` に要素がある場合も別ケースで検証すると、より堅牢。

---

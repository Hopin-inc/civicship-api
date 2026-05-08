# Security Policy

civicship-api のセキュリティ脆弱性を発見した場合の報告手順をまとめています。

> **Note**
> 本ファイルは外部報告者向けの開示ポリシー (Vulnerability Disclosure Policy) です。
> 内部設計 (Auth flow / RLS / supply chain hardening 等) のドキュメントは
> [`docs/handbook/SECURITY.md`](../docs/handbook/SECURITY.md) を参照してください。

## Reporting a Vulnerability

セキュリティ脆弱性は **必ず非公開チャネル** で報告してください。

- 推奨: GitHub の **Private Vulnerability Reporting** 機能から報告
  - 本リポジトリの **Security タブ → Report a vulnerability** ボタンから
    advisory を作成してください (本ファイル `SECURITY.md` を GitHub が認識
    すると自動でリンクが表示されます)
  - GitHub アカウントがあれば誰でも利用可能。レポート / 議論 / fix の調整 / CVE 採番までを 1 つの advisory 内で完結できます。

公開 issue / pull request / discussion 等で **脆弱性の詳細を開示しないでください**。
他の利用者が脆弱性に晒される時間を最小化するため、修正リリースまでは
private advisory 上でのみ議論します。

### 報告に含めてほしい情報

- 影響範囲 (どのコンポーネント / バージョン / endpoint か)
- 再現手順 (PoC があると望ましい)
- 想定される impact (機密情報露出 / 権限昇格 / DoS 等)
- 報告者の連絡先 (GitHub handle で OK)

日本語 / 英語のいずれでも対応します。

## What to Expect

- **受領通知**: 5 営業日以内に advisory 上で acknowledge します
- **初期トリアージ**: 受領後 10 営業日以内に severity / 影響範囲の見立てを返します
- **修正方針**: severity に応じて優先度を決め、修正 PR を private advisory 内で開発
- **公開**: 修正リリース後、advisory を public にして CVE / GHSA ID を発行 (希望者は credit に追加)

確定 SLA は提示できませんが、上記タイムラインを目安として運用しています。

## Out of Scope

以下は本ポリシーの対象外です:

- **第三者依存ライブラリの既知 CVE** — Dependabot / Trivy / `pnpm audit` / GitHub
  Advisory Database で継続監視しており、upstream の patch 待ち / 不到達 path 判定で
  時限 ignore する運用です (`docs/handbook/SECURITY.md` の "Container Image Scanning"
  / "npm Supply Chain Hardening" セクション参照)。
  個別の dep CVE 報告ではなく、upstream に直接 issue を上げてください。
- **物理アクセス / ソーシャルエンジニアリング** が前提となる攻撃
- **本サービスのドメイン外** (フロントエンド / 関連リポジトリ) — それぞれのリポの
  SECURITY.md を参照
- **Brute force / rate-limit / DoS** — インフラ層 (Cloud Run / Cloud Armor) で
  対処しており、本リポでの脆弱性とは扱いません

## Coordinated Disclosure

本プロジェクトは responsible / coordinated disclosure を歓迎します。
報告者の協力により利用者の安全が保たれることを尊重し、修正完了前の早期公開や
SLA 超過時の独自開示は避けてください。長期化が懸念される場合は private advisory
上で開示時期を相談してください。

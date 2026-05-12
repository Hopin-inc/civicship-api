-- =============================================================================
-- Issuer DID Key bootstrap (§5.4.3 / §G)
-- =============================================================================
--
-- 用途: 新規環境 (dev / staging / prd) で `t_issuer_did_keys` テーブルに
-- 最初の KMS key version を 1 件 INSERT し、`/.well-known/did.json` が
-- static fallback (verificationMethod 無し) → 実 KMS 鍵を含む Document を
-- 返すように切り替える操作。
--
-- 前提:
--   1. Cloud KMS 側で Ed25519 cryptoKey + version 1 を作成済み
--      (docs/runbooks/issuer-did-key-rotation.md 参照、もしくは PoC 履歴)
--   2. API を動かす service account に以下が付与済み:
--        - roles/cloudkms.signer
--        - roles/cloudkms.publicKeyViewer
--   3. 下記の `kms_key_resource_name` 値を **使用する環境に合わせて差し替える**:
--        - kyoso-dev-453010 / asia-northeast1 / ... / cryptoKeyVersions/1 (dev 用テンプレ)
--        - prod project / location / cryptoKeyVersions/N (本番用)
--
-- 実行方法 (WebStorm DB tool 経由):
--   1. WebStorm の Database tool で対象環境の DB に接続
--   2. このファイルを開いて、目的の environment の VALUES 句を選択
--   3. "Execute" でクエリ実行
--   4. SELECT 文 (下部) で row が入ったことを確認
--
-- 実行方法 (CLI 経由、参考):
--   psql "$DATABASE_URL" -f docs/runbooks/issuer-did-key-bootstrap.sql
--
-- 冪等性:
--   `kms_key_resource_name` が @unique なので、2 回流しても 1 件目以降は
--   ON CONFLICT DO NOTHING で no-op になる。安心して何度でも実行可。
--
-- 設計参照:
--   docs/report/did-vc-internalization.md §5.4.3
--   docs/report/did-vc-internalization.md §G    (key rotation overlap)
-- =============================================================================


-- ---------------------------------------------------------------------------
-- [dev] kyoso-dev-453010 / asia-northeast1
-- ---------------------------------------------------------------------------
-- KMS PoC で動作確認済みの key version。WebStorm でこのブロックだけ選択して
-- 実行してください。
INSERT INTO t_issuer_did_keys (
  id,
  kms_key_resource_name,
  activated_at,
  created_at
)
VALUES (
  gen_random_uuid()::text,
  'projects/kyoso-dev-453010/locations/asia-northeast1/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/1',
  now(),
  now()
)
ON CONFLICT (kms_key_resource_name) DO NOTHING;


-- ---------------------------------------------------------------------------
-- [prd] 本番用テンプレート (production 用に資源名を差し替えて使う)
-- ---------------------------------------------------------------------------
-- 本番では KeyRing / cryptoKey の resource 名を差し替えてから実行する。
-- 上記の dev ブロックと同時に流さないこと (本番 INSERT を間違って dev DB に
-- 流す事故を防ぐため、コメントアウトで配信する)。
--
-- INSERT INTO t_issuer_did_keys (
--   id,
--   kms_key_resource_name,
--   activated_at,
--   created_at
-- )
-- VALUES (
--   gen_random_uuid()::text,
--   'projects/<PRD_PROJECT_ID>/locations/asia-northeast1/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/1',
--   now(),
--   now()
-- )
-- ON CONFLICT (kms_key_resource_name) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 確認: INSERT 後の状態をチェック
-- ---------------------------------------------------------------------------
SELECT
  id,
  kms_key_resource_name,
  activated_at,
  deactivated_at,
  created_at
FROM t_issuer_did_keys
ORDER BY activated_at DESC;
-- 期待:
--   - 1 行 (deactivated_at IS NULL)
--   - kms_key_resource_name が PoC / 本番で確認した値と一致
--
-- 続いて `GET /.well-known/did.json` を叩いて
-- verificationMethod[0].publicKeyJwk.x が 32-byte base64url で出れば
-- KMS → API → DID Document の経路が通っている証拠です。

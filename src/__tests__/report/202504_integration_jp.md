# 🧪 インテグレーションテスト報告書

## integration/pointTransfer/donateSelfPoint.test.ts（自己ポイント寄付）

### ✅ 成功系
- `should donate points when balance is sufficient`
    - 残高十分な場合、ポイント寄付に成功し、トランザクションが記録される

### ❌ 失敗系
- `should fail to donate if balance is insufficient`
    - 残高不足の場合、寄付に失敗し、`Insufficient balance` エラーが発生

---

## integration/pointTransfer/evaluatePassParticipation.test.ts（体験評価・ポイント付与）

### ✅ 成功系
- `creates POINT_REWARD transaction on evaluation`
    - 体験評価時に `POINT_REWARD` トランザクションが作成される
- `transfers points from opportunityOwner to participation wallet`
    - 機会提供者ウォレット → 参加者ウォレットへ正しくポイント移動される
- `updates currentPointView after evaluation`
    - ウォレット残高が正しく更新される

---

## integration/pointTransfer/grantCommunityPoint.test.ts（コミュニティポイント付与）

### ✅ 成功系
- `should grant points from community wallet to user`
    - コミュニティウォレットからユーザーへのポイント付与が成功する

### ❌ 失敗系
- `should fail to grant if community wallet has insufficient balance`
    - 残高不足の場合、付与に失敗し、`Insufficient balance` エラーが発生

---

## integration/pointTransfer/issueCommunityPoint.test.ts（コミュニティポイント発行）

### ✅ 成功系
- `should issue community points`
    - コミュニティウォレットへのポイント発行が成功する

---

## integration/pointTransfer/ticketClaim.test.ts（チケットクレーム）

### ✅ 成功系
- `should claim ticket successfully`
    - チケットクレームが正常に完了し、複数チケットを受領できる
- `should transfer points correctly between owner and claimer`
    - チケットオーナー → クレーム者へのポイント移動が正しく行われる
- `should refresh currentPointView after claim`
    - ウォレット残高が正しく更新される
- `should auto-join community if not a member`
    - コミュニティ未加入時、自動でメンバー登録される

### ❌ 失敗系
- `should fail if owner wallet has insufficient points`
    - オーナー残高不足でクレーム失敗 (`insufficient` エラー)
- `should not allow claiming the same ticket twice`
    - チケット二重クレーム禁止 (`already been used` エラー)
- `should fail when claimLinkId is invalid`
    - 存在しないクレームリンクID指定時、`not found` エラー発生

---

# 🧪 インテグレーションテスト報告書（成功系・失敗系分類版・続き）

## integration/roleManagament/accpetInvitation.test.ts（招待承認）

### ✅ 成功系
- `should accept invitation, join community, create wallet, and switch rich menu`
    - 招待承認時に、JOINステータス更新・ウォレット作成・リッチメニュー切替が正常に行われる
- `should not change status if already joined`
    - すでにJOIN済みの場合、ステータス変更をスキップする
- `should create membership if not found and join community`
    - Membershipが存在しない場合でも作成し、JOIN状態で登録できる

---

## integration/roleManagament/assignManager.test.ts（マネージャー権限付与）

### ✅ 成功系
- `should assign manager role to membership and switch rich menu`
    - MEMBERロールからMANAGERロールへ正常に昇格し、リッチメニュー切替も実施される

---

## integration/roleManagament/assignMember.test.ts（メンバー権限付与）

### ✅ 成功系
- `should assign member role to membership and switch rich menu`
    - MANAGERロールからMEMBERロールへ正常に降格し、リッチメニュー切替も実施される

---

## integration/roleManagament/assignOwner.test.ts（オーナー権限付与）

### ✅ 成功系
- `should assign owner role to membership and switch rich menu`
    - MEMBERロールからOWNERロールへ正常に昇格し、リッチメニュー切替も実施される

---

## integration/signUp/signUp.test.ts（サインアップ）

### ✅ 成功系
- `should return user when sign up is successful`
    - 正常にユーザー作成＋ウォレット作成が行われ、サインアップが成功する

### ❌ 失敗系
- `should throw error when sign up with non-existent communityId`
    - 存在しないCommunity ID指定時、`No 'Community' record` エラーをスローする

---

## integration/walletCreation/createCommunity.test.ts（コミュニティ作成時ウォレット生成）

### ✅ 成功系
- `should create a member wallet if not existed`
    - コミュニティ作成時、Community Wallet が自動生成される

---

## integration/walletCreation/donateSelfPoint.test.ts（自己ポイント寄付時ウォレット生成）

### ✅ 成功系
- `should create member wallet if not exists when donate self points`
    - 寄付先のMember Walletが存在しない場合、自動生成し、正しくポイント寄付が完了する

---

## integration/walletCreation/grantCommunityPoint.test.ts（ポイント付与時ウォレット生成）

### ✅ 成功系
- `should grant community points to a user`
    - ユーザーに対してCommunity Walletからポイント付与し、Member Walletが必要に応じて自動生成される

---

## integration/walletCreation/reserveParticipation.test.ts（参加予約時ウォレット生成）

### ✅ 成功系
- `should create a member wallet if not existed`
    - 予約時、Member Walletが存在しない場合に自動生成される
- `should not create a member wallet if existed`
    - すでにMember Walletが存在していれば、新規作成せず再利用される
# 🧪 Integration test report

## integration/pointTransfer/donateSelfPoint.test.ts (self-point donation)

### ✅ Success
- `should donate points when balance is sufficient`
- If the balance is sufficient, the point donation is successful and the transaction is recorded

### ❌ Failure
- `should fail to donate if balance is insufficient`
- If the balance is insufficient, the donation fails and an `Insufficient balance` error occurs

---

## integration/pointTransfer/evaluatePassParticipation.test.ts (experience evaluation/point allocation)

### ✅ Success
- `creates POINT_REWARD transaction on evaluation`
- `POINT_REWARD` transaction is created during experience evaluation
- `transfers points from opportunityOwner to participation wallet`
- Points are correctly transferred from opportunity owner wallet to participant wallet
- `updates currentPointView after evaluation`
- Wallet balance is updated correctly

---

## integration/pointTransfer/grantCommunityPoint.test.ts (Granting community points)

### ✅ Success
- `should grant points from community wallet to user`
- Points are successfully granted from the community wallet to the user

### ❌ Failure
- `should fail to grant if community wallet has insufficient balance`
- If the balance is insufficient, granting fails and an `Insufficient balance` error occurs

---

## integration/pointTransfer/issueCommunityPoint.test.ts (Issuing community points)

### ✅ Success
- `should issue community points`
- Points are successfully issued to the community wallet

---

## integration/pointTransfer/ticketClaim.test.ts (Ticket claim)

### ✅ Success
- `should claim ticket successfully`
- Ticket claim completed successfully, multiple tickets can be received
- `should transfer points correctly between owner and claimer`
- Points are transferred correctly from ticket owner to claimant
- `should refresh currentPointView after claim`
- Wallet balance is updated correctly
- `should auto-join community if not a member`
- If not a member of the community, automatically register as a member

### ❌ Failure
- `should fail if owner wallet has insufficient points`
- Claim fails due to insufficient owner balance (`insufficient` error)
- `should not allow claiming the same ticket twice`
- Ticket double claim prohibited (`already been used` error)
- `should fail when claimLinkId is invalid`
- When a non-existent claim link ID is specified, a `not found` error occurs

---

# 🧪 Integration test report (success/failure classification version, continued)

## integration/roleManagament/accpetInvitation.test.ts (invitation acceptance)

### ✅ Success
- `should accept invitation, join community, create wallet, and switch rich menu`
- When accepting an invitation, JOIN status is updated, wallet is created, and rich menu is switched normally
- `should not change status if already joined`
- Skip status change if already joined
- `should create membership if not found and join community`
- Even if membership does not exist, it can be created and registered in JOIN state

---

## integration/roleManagament/assignManager.test.ts (manager authority assignment)

### ✅ Success
- `should assign manager role to membership and switch rich menu`
- Promoted successfully from MEMBER role to MANAGER role, and rich menu is also switched

---

## integration/roleManagament/assignMember.test.ts (assigning member privileges)

### ✅ Success
- `should assign member role to membership and switch rich menu`
- Demotion from MANAGER role to MEMBER role is successful, and rich menu switching is also performed

---

## integration/roleManagament/assignOwner.test.ts (assigning owner privileges)

### ✅ Success
- `should assign owner role to membership and switch rich menu`
- Promotion from MEMBER role to OWNER role is successful, and rich menu switching is also performed

---

## integration/signUp/signUp.test.ts (signing up)

### ✅ Success
- `should return user when sign up is successful`
- User creation + wallet creation is performed successfully, and sign-up is successful

### ❌ Failure
- `should throw error when sign up with non-existent communityId`
- When a non-existent Community ID is specified, a `No 'Community' record` error is thrown.

---

## integration/walletCreation/createCommunity.test.ts (Wallet creation when creating a community)

### ✅ Success
- `should create a member wallet if not existed`
- Community Wallet is automatically generated when creating a community

---

## integration/walletCreation/donateSelfPoint.test.ts (Wallet creation when donating self points)

### ✅ Success
- `should create member wallet if not exists when donate self points`
- If the Member Wallet does not exist, it will be automatically created and the point donation will be completed correctly.

---

## integration/walletCreation/grantCommunityPoint.test.ts (Wallet creation when granting points)

### ✅ Success
- `should grant community points to a user`
- Points are awarded to users from the Community Wallet, and a Member Wallet is automatically generated as necessary.

---

## integration/walletCreation/reserveParticipation.test.ts (Wallet generation when reserving participation)

### ✅ Success
- `should create a member wallet if not existed`
- Automatically generated if a Member Wallet does not exist when reserving
- `should not create a member wallet if existed`
- If a Member Wallet already exists, it is reused without creating a new one.